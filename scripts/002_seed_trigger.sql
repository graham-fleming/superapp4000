-- Trigger function to seed demo contacts and tasks for every new user
create or replace function public.seed_demo_data_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid; c7 uuid; c8 uuid;
begin
  -- Insert demo contacts
  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Sarah', 'Chen', 'sarah.chen@acmecorp.com', '+1 (415) 555-0102', 'Acme Corp', 'VP of Engineering', 'Met at React Summit 2025. Interested in our enterprise plan.', 'active')
  returning id into c1;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Marcus', 'Johnson', 'm.johnson@brightlabs.io', '+1 (312) 555-0198', 'Bright Labs', 'CTO', 'Referred by Sarah Chen. Evaluating our API integration.', 'lead')
  returning id into c2;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Elena', 'Rodriguez', 'elena@startupventures.co', '+1 (646) 555-0134', 'Startup Ventures', 'Founder & CEO', 'Early-stage startup, looking for growth tools.', 'active')
  returning id into c3;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'David', 'Kim', 'david.kim@globaltrade.com', '+1 (213) 555-0177', 'Global Trade Inc', 'Head of Operations', 'Existing customer since Q1 2025. Renewed annual contract.', 'active')
  returning id into c4;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Priya', 'Patel', 'priya@designforward.studio', '+1 (510) 555-0156', 'Design Forward Studio', 'Creative Director', 'Potential partnership for UI/UX services.', 'lead')
  returning id into c5;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'James', 'Wright', 'jwright@oldbridge.org', '+1 (202) 555-0143', 'Oldbridge Foundation', 'Program Director', 'Non-profit org. Contract ended last quarter.', 'inactive')
  returning id into c6;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Aisha', 'Okafor', 'aisha@cloudnine.tech', '+1 (737) 555-0189', 'CloudNine Tech', 'Product Manager', 'Interested in our analytics dashboard. Demo scheduled.', 'lead')
  returning id into c7;

  insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
  values (new.id, 'Tom', 'Mueller', 'tom.m@precisionmfg.com', '+1 (614) 555-0121', 'Precision Manufacturing', 'IT Director', 'Enterprise customer. Needs custom SSO integration.', 'active')
  returning id into c8;

  -- Insert demo tasks linked to contacts
  insert into public.tasks (user_id, contact_id, title, description, status, priority, due_date) values
    (new.id, c1, 'Send proposal to Acme Corp', 'Prepare and send the enterprise pricing proposal for Acme Corp. Include volume discount options.', 'in_progress', 'high', current_date + 2),
    (new.id, c2, 'Schedule API demo for Bright Labs', 'Set up a technical demo of our REST and GraphQL APIs for Marcus and his dev team.', 'todo', 'high', current_date + 5),
    (new.id, c3, 'Follow up on onboarding progress', 'Check in with Elena to see if her team has completed the onboarding checklist.', 'todo', 'medium', current_date + 3),
    (new.id, c4, 'Quarterly business review prep', 'Prepare Q4 performance report and renewal talking points for Global Trade.', 'in_progress', 'medium', current_date + 7),
    (new.id, c5, 'Draft partnership proposal', 'Create a partnership proposal for Design Forward Studio covering referral terms.', 'todo', 'low', current_date + 14),
    (new.id, c8, 'SSO integration requirements doc', 'Document the technical requirements for Precision Manufacturing custom SSO setup.', 'in_progress', 'high', current_date + 4),
    (new.id, c7, 'Prepare analytics demo environment', 'Set up a sandbox environment with sample data for the upcoming demo.', 'todo', 'medium', current_date + 6),
    (new.id, null, 'Update CRM data export feature', 'Add CSV and PDF export options to the contacts list page.', 'todo', 'low', current_date + 21),
    (new.id, c4, 'Send renewal invoice', 'Generate and send the annual renewal invoice to Global Trade Inc.', 'done', 'high', current_date - 3),
    (new.id, c1, 'Complete onboarding call notes', 'Write up the notes from last week onboarding kickoff call with Acme Corp.', 'done', 'medium', current_date - 5);

  return new;
end;
$$;

-- Drop existing trigger if any
drop trigger if exists on_auth_user_created_seed on auth.users;

-- Create trigger that fires after a new user is inserted
create trigger on_auth_user_created_seed
  after insert on auth.users
  for each row
  execute function public.seed_demo_data_for_new_user();
