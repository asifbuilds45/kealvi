CREATE TABLE polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  question text NOT NULL,
  is_open boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE poll_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id) ON DELETE CASCADE,
  text text NOT NULL,
  position int NOT NULL
);

CREATE TABLE poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls(id),
  option_id uuid REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);