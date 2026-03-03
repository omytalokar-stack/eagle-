import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  projectType: {
    type: String,
    trim: true
  },
  techStack: {
    type: [String],
    default: []
  },
  numPages: {
    type: Number,
    default: null
  },
  calculatedPrice: {
    type: Number,
    default: null
  },
  designImageUrls: {
    type: [String],
    default: []
  },
  websiteCopy: {
    type: String,
    default: ''
  },
  extraFeatures: {
    type: String,
    default: ''
  },
  vision: {
    type: String,
    default: ''
  },
  targetAudience: {
    type: String,
    default: ''
  },
  githubOption: {
    type: String,
    default: ''
  },
  vercelOption: {
    type: String,
    default: ''
  },
  domainConfig: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
bookingSchema.index({ email: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model('Booking', bookingSchema);
