import { Schema, model, models } from 'mongoose';

const OrganizerSchema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const QualificationsSchema = new Schema({
  level: { type: String, required: true },
  fields: [{ type: String }],
});

const ReviewSchema = new Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  date: { type: String, required: true },
});

const CampSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: String, required: true },
  image: { type: String, required: true },
  galleryImages: [{ type: String }],
  description: { type: String, required: true },
  deadline: { type: String, required: true },
  participantCount: { type: Number, required: true },
  activityFormat: { type: String, required: true },
  qualifications: { type: QualificationsSchema, required: true },
  additionalInfo: [{ type: String }],
  organizers: [OrganizerSchema],
  reviews: [ReviewSchema],
  avgRating: { type: Number, default: 0 },
  ratingBreakdown: {
    type: Map,
    of: Number,
    default: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
  },
  featured: { type: Boolean, default: false },
  slug: { type: String, unique: true, required: true },
}, {
  timestamps: true,
});

// Interface for Review type
interface ReviewType {
  rating: number;
}

// สร้าง slug อัตโนมัติจาก name
CampSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// คำนวณ avgRating และ ratingBreakdown จาก reviews
CampSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const breakdown: { [key: string]: number } = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 };
    let totalRating = 0;

    this.reviews.forEach((review: ReviewType) => {
      totalRating += review.rating;
      breakdown[review.rating.toString()]++;
    });

    this.avgRating = totalRating / this.reviews.length;
    this.ratingBreakdown = new Map(Object.entries(breakdown));
  }
  next();
});

const Camp = models.Camp || model('Camp', CampSchema);

export default Camp;