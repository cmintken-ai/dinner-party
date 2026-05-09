export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
  notify_email: boolean
  notify_sms: boolean
  is_admin: boolean
  created_at: string
}

export interface Restaurant {
  id: string
  name: string
  neighborhood: string
  cuisine: string
  area: 'seattle' | 'snohomish'
  added_by: string
  created_at: string
}

export interface Dinner {
  id: string
  restaurant_id: string
  restaurant?: Restaurant
  date: string
  notes?: string
  thumb: 'up' | 'down' | null
  added_by: string
  created_at: string
  attendees?: DinnerAttendee[]
  dishes?: Dish[]
  cocktails?: Cocktail[]
}

export interface DinnerAttendee {
  id: string
  dinner_id: string
  user_id: string
  profile?: Profile
}

export interface Dish {
  id: string
  dinner_id: string
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  added_by: string
}

export interface Cocktail {
  id: string
  dinner_id: string
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  added_by: string
}

export interface WishlistItem {
  id: string
  restaurant_id: string
  restaurant?: Restaurant
  added_by: string
  notes?: string
  upvotes?: WishlistUpvote[]
  created_at: string
}

export interface WishlistUpvote {
  id: string
  wishlist_id: string
  user_id: string
}

export interface Availability {
  id: string
  user_id: string
  profile?: Profile
  date: string
  available: boolean
  created_at: string
}
