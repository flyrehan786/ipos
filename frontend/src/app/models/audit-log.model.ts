export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}
