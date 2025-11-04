-- Baseline services and plans seed script
-- Run after applying migrations to populate reference data used by the application.

BEGIN;

-- Baseline services
INSERT INTO services (id, name, description)
VALUES
    (gen_random_uuid(), 'Identity Verification', 'Core identity verification workflows and API access.'),
    (gen_random_uuid(), 'Messaging', 'Transactional and marketing messaging delivery platform.'),
    (gen_random_uuid(), 'Analytics', 'Usage analytics, dashboards, and reporting service.')
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();

-- Baseline plans for each service
-- Identity Verification service plans
WITH identity_service AS (
    SELECT id FROM services WHERE name = 'Identity Verification' LIMIT 1
)
INSERT INTO plans (id, service_id, name, code, billing_cycle, price, description)
SELECT gen_random_uuid(), id, plan_name, plan_code, billing_cycle, price, plan_description
FROM identity_service,
     (VALUES
        ('Starter', 'ID_STARTER', 'monthly', 49.00, 'Up to 1,000 verifications per month with email support.'),
        ('Growth', 'ID_GROWTH', 'monthly', 149.00, 'Up to 10,000 verifications per month with priority support.'),
        ('Enterprise', 'ID_ENTERPRISE', 'yearly', 1499.00, 'Custom limits, SLA-backed support, and dedicated success manager.')
     ) AS t(plan_name, plan_code, billing_cycle, price, plan_description)
ON CONFLICT (service_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    billing_cycle = EXCLUDED.billing_cycle,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Messaging service plans
WITH messaging_service AS (
    SELECT id FROM services WHERE name = 'Messaging' LIMIT 1
)
INSERT INTO plans (id, service_id, name, code, billing_cycle, price, description)
SELECT gen_random_uuid(), id, plan_name, plan_code, billing_cycle, price, plan_description
FROM messaging_service,
     (VALUES
        ('Notify', 'MSG_NOTIFY', 'monthly', 29.00, '10,000 outbound messages per month, basic analytics.'),
        ('Engage', 'MSG_ENGAGE', 'monthly', 99.00, '100,000 outbound messages per month, advanced segmentation.'),
        ('Scale', 'MSG_SCALE', 'monthly', 299.00, '1M outbound messages per month, deliverability consulting included.')
     ) AS t(plan_name, plan_code, billing_cycle, price, plan_description)
ON CONFLICT (service_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    billing_cycle = EXCLUDED.billing_cycle,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Analytics service plans
WITH analytics_service AS (
    SELECT id FROM services WHERE name = 'Analytics' LIMIT 1
)
INSERT INTO plans (id, service_id, name, code, billing_cycle, price, description)
SELECT gen_random_uuid(), id, plan_name, plan_code, billing_cycle, price, plan_description
FROM analytics_service,
     (VALUES
        ('Insights', 'AN_INSIGHTS', 'monthly', 59.00, 'Self-serve dashboards, data export once per day.'),
        ('Pro', 'AN_PRO', 'monthly', 199.00, 'Real-time dashboards, custom alerts, and daily exports.'),
        ('Enterprise', 'AN_ENTERPRISE', 'yearly', 1999.00, 'Unlimited data history, white-labeled analytics, dedicated analyst support.')
     ) AS t(plan_name, plan_code, billing_cycle, price, plan_description)
ON CONFLICT (service_id, code) DO UPDATE SET
    name = EXCLUDED.name,
    billing_cycle = EXCLUDED.billing_cycle,
    price = EXCLUDED.price,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;
