-- Create a security definer function to backfill demo data
create or replace function public.backfill_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  u record;
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid; c7 uuid; c8 uuid;
begin
  for u in
    select au.id
    from auth.users au
    where not exists (
      select 1 from public.contacts c where c.user_id = au.id
    )
  loop
    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Sarah', 'Chen', 'sarah.chen@acmecorp.com', '+1 (415) 555-0102', 'Acme Corp', 'VP of Engineering', 'Met at React Summit 2025. Interested in enterprise plan.', 'active')
    returning id into c1;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Marcus', 'Johnson', 'm.johnson@brightlabs.io', '+1 (312) 555-0198', 'Bright Labs', 'CTO', 'Referred by Sarah Chen. Evaluating API integration.', 'lead')
    returning id into c2;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Elena', 'Rodriguez', 'elena@startupventures.co', '+1 (646) 555-0134', 'Startup Ventures', 'Founder and CEO', 'Early-stage startup, looking for growth tools.', 'active')
    returning id into c3;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'David', 'Kim', 'david.kim@globaltrade.com', '+1 (213) 555-0177', 'Global Trade Inc', 'Head of Operations', 'Existing customer since Q1 2025. Renewed annual contract.', 'active')
    returning id into c4;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Priya', 'Patel', 'priya@designforward.studio', '+1 (510) 555-0156', 'Design Forward Studio', 'Creative Director', 'Potential partnership for UI/UX services.', 'lead')
    returning id into c5;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'James', 'Wright', 'jwright@oldbridge.org', '+1 (202) 555-0143', 'Oldbridge Foundation', 'Program Director', 'Non-profit org. Contract ended last quarter.', 'inactive')
    returning id into c6;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Aisha', 'Okafor', 'aisha@cloudnine.tech', '+1 (737) 555-0189', 'CloudNine Tech', 'Product Manager', 'Interested in analytics dashboard. Demo scheduled.', 'lead')
    returning id into c7;

    insert into public.contacts (user_id, first_name, last_name, email, phone, company, role, notes, status)
    values (u.id, 'Tom', 'Mueller', 'tom.m@precisionmfg.com', '+1 (614) 555-0121', 'Precision Manufacturing', 'IT Director', 'Enterprise customer. Needs custom SSO integration.', 'active')
    returning id into c8;

    insert into public.tasks (user_id, contact_id, title, description, status, priority, due_date) values
      (u.id, c1, 'Send proposal to Acme Corp', 'Prepare and send the enterprise pricing proposal for Acme Corp.', 'in_progress', 'high', current_date + 2),
      (u.id, c2, 'Schedule API demo for Bright Labs', 'Set up a technical demo of our APIs for Marcus and his team.', 'todo', 'high', current_date + 5),
      (u.id, c3, 'Follow up on onboarding progress', 'Check in with Elena on the onboarding checklist.', 'todo', 'medium', current_date + 3),
      (u.id, c4, 'Quarterly business review prep', 'Prepare Q4 performance report for Global Trade.', 'in_progress', 'medium', current_date + 7),
      (u.id, c5, 'Draft partnership proposal', 'Create a partnership proposal for Design Forward Studio.', 'todo', 'low', current_date + 14),
      (u.id, c8, 'SSO integration requirements doc', 'Document SSO requirements for Precision Manufacturing.', 'in_progress', 'high', current_date + 4),
      (u.id, c7, 'Prepare analytics demo environment', 'Set up a sandbox with sample data for the demo.', 'todo', 'medium', current_date + 6),
      (u.id, null, 'Update CRM data export feature', 'Add CSV and PDF export options to the contacts page.', 'todo', 'low', current_date + 21),
      (u.id, c4, 'Send renewal invoice', 'Generate and send the annual renewal invoice to Global Trade.', 'done', 'high', current_date - 3),
      (u.id, c1, 'Complete onboarding call notes', 'Write up notes from onboarding kickoff call with Acme Corp.', 'done', 'medium', current_date - 5);
  end loop;
end;
$$;

-- Run the function
select public.backfill_demo_data();

-- Clean up - drop the function after use
drop function public.backfill_demo_data();
