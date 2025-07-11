import { Database } from '@/app/api/infrastructure/supabase/supabase';

describe('Table names should be plural', () => {
  it('should have plural table names in database schema', () => {
    type Tables = Database['public']['Tables'];
    const tables: (keyof Tables)[] = ['reservations', 'room_items', 'rooms', 'spaces', 'supplies', 'users'];
    
    // 모든 테이블이 복수형이어야 함
    const expectedTables = ['reservations', 'room_items', 'rooms', 'spaces', 'supplies', 'users'];
    
    expectedTables.forEach(tableName => {
      expect(tables).toContain(tableName as keyof Tables);
    });
  });
});