-- Allow Super Users to view all profiles
-- Without this, they can't see the list of users or pending approvals
create policy "Super User view all profiles"
on public.profiles for select
using (
  auth.uid() in (
    select id from public.profiles where role = 'Super User'
  )
);

-- Allow Super Users to update all profiles
-- This is critical for approving users and changing roles
create policy "Super User update all profiles"
on public.profiles for update
using (
  auth.uid() in (
    select id from public.profiles where role = 'Super User'
  )
);

-- Just in case, allow Super Users to insert profiles (though usually handled by triggers)
create policy "Super User insert all profiles"
on public.profiles for insert
with check (
  auth.uid() in (
    select id from public.profiles where role = 'Super User'
  )
);

-- Ensure normal users can still view their own profile
-- (Already covered by "profiles_select_own" but good to be explicit if that's missing)
-- drop policy if exists "profiles_select_own" on public.profiles;
-- create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

-- Ensure normal users can NOT update their own status/role (only profile details if we had any)
-- For now, maybe allow users to update their own name?
-- create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
