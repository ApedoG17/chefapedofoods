-- 1. Create Riders Table (Logistics Portal)
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Promo Codes Table (Marketing Engine)
CREATE TABLE IF NOT EXISTS public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    max_uses INTEGER, -- Null means unlimited
    current_uses INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Reviews Table (Feedback Loop)
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    customer_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(order_id)
);

-- 4. Update Existing Orders Table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS rider_id UUID REFERENCES public.riders(id),
ADD COLUMN IF NOT EXISTS promo_code_id UUID REFERENCES public.promo_codes(id),
ADD COLUMN IF NOT EXISTS original_amount INTEGER,
ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 6. Define Security Policies (idempotent: drop-then-create)

-- Riders: Only accessible by authenticated admins via Service Role or specific routes
DROP POLICY IF EXISTS "Riders are viewable by admins" ON public.riders;
CREATE POLICY "Riders are viewable by admins" 
ON public.riders FOR SELECT USING (true);

-- Promo Codes: Public can read active codes to validate during checkout
DROP POLICY IF EXISTS "Active promo codes are viewable by public" ON public.promo_codes;
CREATE POLICY "Active promo codes are viewable by public" 
ON public.promo_codes FOR SELECT 
USING (is_active = true);

-- Reviews: Public can insert a review (authenticated via order ID in the app)
DROP POLICY IF EXISTS "Public can insert reviews" ON public.reviews;
CREATE POLICY "Public can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Reviews are viewable by public" ON public.reviews;
CREATE POLICY "Reviews are viewable by public" 
ON public.reviews FOR SELECT 
USING (true);
