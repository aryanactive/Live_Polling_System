-- Create polls table for storing poll data
CREATE TABLE public.polls (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    time_limit INTEGER NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_votes INTEGER NOT NULL DEFAULT 0
);

-- Create poll_votes table for storing individual votes
CREATE TABLE public.poll_votes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    option_id TEXT NOT NULL,
    voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(poll_id, user_id)
);

-- Create chat_messages table for real-time chat
CREATE TABLE public.chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL CHECK (user_role IN ('teacher', 'student')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table for tracking active users
CREATE TABLE public.participants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a classroom app)
CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Anyone can create polls" ON public.polls FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update polls" ON public.polls FOR UPDATE USING (true);

CREATE POLICY "Anyone can view votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can create votes" ON public.poll_votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view chat messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can create chat messages" ON public.chat_messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view participants" ON public.participants FOR SELECT USING (true);
CREATE POLICY "Anyone can manage participants" ON public.participants FOR ALL USING (true);

-- Enable realtime for all tables
ALTER TABLE public.polls REPLICA IDENTITY FULL;
ALTER TABLE public.poll_votes REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;