-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS organization_user_app_roles CASCADE;

-- Create organization_user_app_roles table
CREATE TABLE organization_user_app_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_role TEXT NOT NULL CHECK (app_role IN ('owner', 'chef', 'sous_chef', 'supervisor', 'team_member')),
  kitchen_role TEXT NOT NULL CHECK (kitchen_role IN ('owner', 'chef', 'sous_chef', 'supervisor', 'team_member')),
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(organization_id, user_id)
);

-- Enable RLS
ALTER TABLE organization_user_app_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view roles in their organization"
  ON organization_user_app_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = organization_user_app_roles.organization_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage roles"
  ON organization_user_app_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_roles
      WHERE organization_id = organization_user_app_roles.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND system_role = 'dev'
    )
  );

-- Create indexes
CREATE INDEX idx_org_user_app_roles_org_id ON organization_user_app_roles(organization_id);
CREATE INDEX idx_org_user_app_roles_user_id ON organization_user_app_roles(user_id);
CREATE INDEX idx_org_user_app_roles_app_role ON organization_user_app_roles(app_role);

-- Create trigger for updated_at
CREATE TRIGGER update_org_user_app_roles_updated_at
  BEFORE UPDATE ON organization_user_app_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE organization_user_app_roles IS 'Stores user roles and permissions within an organization';
COMMENT ON COLUMN organization_user_app_roles.app_role IS 'Application-level role for system access';
COMMENT ON COLUMN organization_user_app_roles.kitchen_role IS 'Kitchen-specific role for operational permissions';
COMMENT ON COLUMN organization_user_app_roles.permissions IS 'Custom permission overrides';

-- Insert initial data for Steve
DO $$
DECLARE
  steve_id uuid;
  org_id uuid := 'c1e1f1b1-1e1e-1e1e-1e1e-1e1e1e1e1e1e';
BEGIN
  -- Get Steve's user ID
  SELECT id INTO steve_id
  FROM auth.users
  WHERE email = 'office@memphisfirebbq.com';

  IF steve_id IS NOT NULL THEN
    -- Insert Steve's role
    INSERT INTO organization_user_app_roles (
      organization_id,
      user_id,
      app_role,
      kitchen_role,
      permissions,
      is_active
    )
    VALUES (
      org_id,
      steve_id,
      'owner',
      'owner',
      '{
        "inventory": {"view": true, "create": true, "edit": true, "delete": true},
        "recipes": {"view": true, "create": true, "edit": true, "delete": true},
        "production": {"view": true, "create": true, "edit": true, "delete": true},
        "reports": {"view": true, "create": true, "edit": true, "delete": true},
        "settings": {"view": true, "create": true, "edit": true, "delete": true},
        "users": {"view": true, "create": true, "edit": true, "delete": true}
      }'::jsonb,
      true
    )
    ON CONFLICT (organization_id, user_id) DO UPDATE
    SET 
      app_role = EXCLUDED.app_role,
      kitchen_role = EXCLUDED.kitchen_role,
      permissions = EXCLUDED.permissions,
      is_active = EXCLUDED.is_active,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
END $$;