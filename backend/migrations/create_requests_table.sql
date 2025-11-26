CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,            -- who requested it
    medicine_name TEXT NOT NULL,
    quantity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Approved, Delivered, Cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
