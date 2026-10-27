import { FarmerListing, BuyerOffer, PaymentRecord } from '../types';

const STORAGE_PREFIX = 'kisansaathi_';

export interface AcceptOfferResult {
  updatedListings: FarmerListing[];
  updatedOffers: BuyerOffer[];
  updatedPayments: PaymentRecord[];
  acceptedOffer: BuyerOffer | null;
  error?: string;
}

export const marketplaceService = {
  // Safe inventory deduction to prevent overselling and duplicate processing
  acceptOffer: (
    offerId: string, 
    listings: FarmerListing[], 
    offers: BuyerOffer[], 
    payments: PaymentRecord[]
  ): AcceptOfferResult => {
    // 1. Validate Target Offer
    const targetOffer = offers.find(o => o.id === offerId);
    if (!targetOffer) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Offer not found' 
      };
    }

    // Prevent accepting the same offer more than once or modifying already processed offers
    if (targetOffer.status === 'accepted') {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Offer is already accepted' 
      };
    }

    if (targetOffer.status === 'declined') {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Offer was already declined' 
      };
    }

    // 2. Validate Associated Listing
    const targetListing = listings.find(l => l.id === targetOffer.listingId);
    if (!targetListing) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Associated listing not found' 
      };
    }

    // Verify ownership
    if (targetListing.farmerId !== targetOffer.farmerId) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Unauthorized listing mismatch' 
      };
    }

    // Validate quantities and prices
    if (!targetOffer.quantityQuintals || targetOffer.quantityQuintals <= 0) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Quantity must be greater than zero' 
      };
    }

    if (!targetOffer.offerPricePerQuintal || targetOffer.offerPricePerQuintal <= 0) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: 'Price must be greater than zero' 
      };
    }

    // Prevent accepting offers exceeding available inventory (Overselling Prevention)
    if (targetOffer.quantityQuintals > targetListing.quantityQuintals) {
      return { 
        updatedListings: listings, 
        updatedOffers: offers, 
        updatedPayments: payments, 
        acceptedOffer: null,
        error: `Insufficient stock: only ${targetListing.quantityQuintals} Q remaining` 
      };
    }

    // 3. Update Offer Status
    const updatedOffers = offers.map(o => 
      o.id === offerId ? { ...o, status: 'accepted' as const } : o
    );

    // 4. Safely deduct inventory from associated listing
    const remainingQty = targetListing.quantityQuintals - targetOffer.quantityQuintals;
    const updatedListings = listings.map(l => {
      if (l.id === targetListing.id) {
        return {
          ...l,
          quantityQuintals: remainingQty,
          status: remainingQty === 0 ? ('sold_out' as const) : l.status
        };
      }
      return l;
    });

    // 5. Create payment record in Net Payment Ledger (Unpaid / pending payment)
    // Guard against duplicate payment creation for the same offer
    let updatedPayments = [...payments];
    const paymentAlreadyExists = payments.some(p => p.offerId === targetOffer.id);
    
    if (!paymentAlreadyExists) {
      const grossVal = Math.round(targetOffer.quantityQuintals * targetOffer.offerPricePerQuintal);
      const labourCost = Math.round(targetOffer.quantityQuintals * 75); // ₹75/Q handling
      const transportCost = Math.round(targetOffer.quantityQuintals * 50); // ₹50/Q transport

      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        farmerId: targetOffer.farmerId,
        buyerId: targetOffer.buyerId,
        buyerName: targetOffer.buyerName,
        offerId: targetOffer.id,
        cropName: targetOffer.cropName,
        quantityQuintals: targetOffer.quantityQuintals,
        ratePerQuintal: targetOffer.offerPricePerQuintal,
        grossAmount: grossVal,
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        isReceived: false, // Strictly false: never mark as received automatically!
        labourCost,
        transportCost,
        createdAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      updatedPayments = [newPayment, ...payments];
    }

    // Persist
    try {
      localStorage.setItem(`${STORAGE_PREFIX}listings`, JSON.stringify(updatedListings));
      localStorage.setItem(`${STORAGE_PREFIX}offers`, JSON.stringify(updatedOffers));
      localStorage.setItem(`${STORAGE_PREFIX}payments`, JSON.stringify(updatedPayments));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }

    return {
      updatedListings,
      updatedOffers,
      updatedPayments,
      acceptedOffer: { ...targetOffer, status: 'accepted' }
    };
  },

  declineOffer: (
    offerId: string, 
    offers: BuyerOffer[]
  ): BuyerOffer[] => {
    const targetOffer = offers.find(o => o.id === offerId);
    if (!targetOffer) return offers;

    // Do NOT allow declining an already accepted offer (would invalidate inventory and ledger)
    if (targetOffer.status !== 'pending') {
      console.warn(`Cannot decline offer ${offerId} with status '${targetOffer.status}'`);
      return offers;
    }

    const updatedOffers = offers.map(o => 
      o.id === offerId ? { ...o, status: 'declined' as const } : o
    );
    try {
      localStorage.setItem(`${STORAGE_PREFIX}offers`, JSON.stringify(updatedOffers));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
    return updatedOffers;
  },

  createListing: (
    newListing: FarmerListing,
    currentListings: FarmerListing[]
  ): FarmerListing[] => {
    // Basic validation
    if (!newListing.quantityQuintals || newListing.quantityQuintals <= 0 || !newListing.askingPricePerQuintal || newListing.askingPricePerQuintal <= 0) {
      console.warn('Invalid listing data rejected:', newListing);
      return currentListings;
    }

    const updated = [newListing, ...currentListings];
    try {
      localStorage.setItem(`${STORAGE_PREFIX}listings`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
    return updated;
  },

  submitBuyerOffer: (
    offer: BuyerOffer,
    currentOffers: BuyerOffer[]
  ): BuyerOffer[] => {
    // Validation
    if (!offer.quantityQuintals || offer.quantityQuintals <= 0 || !offer.offerPricePerQuintal || offer.offerPricePerQuintal <= 0) {
      console.warn('Invalid offer rejected:', offer);
      return currentOffers;
    }

    const updated = [offer, ...currentOffers];
    try {
      localStorage.setItem(`${STORAGE_PREFIX}offers`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage persistence warning:', e);
    }
    return updated;
  }
};
