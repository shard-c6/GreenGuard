-- Create a function to auto-insert a user into the public.profiles table
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
begin
  -- Skip if this is a standard email registration (handled by backend)
  -- Social providers will have 'google', 'apple', or 'facebook' in the raw_app_meta_data->>'provider'
  if new.raw_app_meta_data->>'provider' is null or new.raw_app_meta_data->>'provider' = 'email' then
    return new;
  end if;

  -- Generate a base username from the email if not provided
  base_username := coalesce(
    new.raw_user_meta_data->>'user_name',
    split_part(new.email, '@', 1)
  );
  
  -- Fallback if username is somehow empty
  if base_username is null or base_username = '' then
    base_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- Ensure unique username
  final_username := base_username;
  while exists(select 1 from public.profiles where username = final_username) loop
    final_username := base_username || '_' || floor(random() * 10000)::int;
  end loop;

  insert into public.profiles (
    id,
    email,
    username,
    display_name,
    role,
    avatar_url
  ) values (
    new.id,
    new.email,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', final_username),
    'adopter', -- Default role for OAuth users
    new.raw_user_meta_data->>'avatar_url'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
