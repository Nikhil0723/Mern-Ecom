import Offer from "../models/offerModel.js";


export const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({}).sort({ createdAt: -1 });

    return res.status(200).json(offers);
  } catch (error) {
    console.error('Error in getOffers:', error.message);
    return res.status(500).json({ message: 'Failed to fetch offers' });
  }
};


export const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();

    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    return res.status(200).json(offers);
  } catch (error) {
    console.error('Error in getActiveOffers:', error.message);
    return res.status(500).json({ message: 'Failed to fetch active offers' });
  }
};



export const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    return res.status(200).json(offer);
  } catch (error) {
    console.error('Error in getOfferById:', error.message);
    return res.status(500).json({ message: 'Failed to fetch offer' });
  }
};


export const createOffer = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      image,
      publicId,
      buttonText,
      buttonLink,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Offer title is required' });
    }

    const trimmedImage = image?.trim();

    if (!trimmedImage) {
      return res.status(400).json({ message: 'Offer banner image is required' });
    }

    if (!startDate) {
      return res.status(400).json({ message: 'Start date is required' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'End date is required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid offer dates' });
    }

    if (end <= start) {
      return res.status(400).json({
        message: 'End date must be later than start date',
      });
    }

    // Create offer
    const offer = await Offer.create({
      title: trimmedTitle,
      subtitle: subtitle?.trim() || '',
      description: description?.trim() || '',
      image: trimmedImage,
      publicId: publicId?.trim() || '',
      buttonText: buttonText?.trim() || 'Shop Now',
      buttonLink: buttonLink?.trim() || '/shop',
      startDate: start,
      endDate: end,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return res.status(201).json(offer);
  } catch (error) {
    console.error('Error in createOffer:', error.message);
    return res.status(500).json({ message: 'Failed to create offer' });
  }
};

export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    const {
      title,
      subtitle,
      description,
      image,
      publicId,
      buttonText,
      buttonLink,
      startDate,
      endDate,
      isActive,
    } = req.body;

    if (title !== undefined) {
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        return res.status(400).json({ message: 'Offer title is required' });
      }

      offer.title = trimmedTitle;
    }

    if (subtitle !== undefined) {
      offer.subtitle = subtitle.trim();
    }

    if (description !== undefined) {
      offer.description = description.trim();
    }

    if (image !== undefined) {
      const trimmedImage = image.trim();

      if (!trimmedImage) {
        return res.status(400).json({ message: 'Offer banner image is required' });
      }

      offer.image = trimmedImage;
    }

    if (publicId !== undefined) {
      offer.publicId = publicId.trim();
    }

    if (buttonText !== undefined) {
      offer.buttonText = buttonText.trim() || 'Shop Now';
    }

    if (buttonLink !== undefined) {
      offer.buttonLink = buttonLink.trim() || '/shop';
    }

    // Update dates if provided
    if (startDate !== undefined) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid start date' });
      }

      offer.startDate = start;
    }

    if (endDate !== undefined) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid end date' });
      }

      offer.endDate = end;
    }

    // Validate combined dates (only matters if start or end was updated)
    if (offer.endDate <= offer.startDate) {
      return res.status(400).json({
        message: 'End date must be later than start date',
      });
    }

    if (typeof isActive === 'boolean') {
      offer.isActive = isActive;
    }

    const updatedOffer = await offer.save();

    return res.status(200).json(updatedOffer);
  } catch (error) {
    console.error('Error in updateOffer:', error.message);
    return res.status(500).json({ message: 'Failed to update offer' });
  }
};


export const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    await offer.deleteOne();

    return res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error in deleteOffer:', error.message);
    return res.status(500).json({ message: 'Failed to delete offer' });
  }
};