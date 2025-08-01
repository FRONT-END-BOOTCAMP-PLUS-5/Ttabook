import { UserRepository } from '../../domains/repositories/UserRepository';
import { User } from '../../domains/entities/User';
import { SupabaseClient } from '@supabase/supabase-js';

export class SupabaseUserRepository implements UserRepository {
  private supabase: SupabaseClient;
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 사용자를 찾을 수 없음
      }
      throw new Error(`사용자 조회 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // 사용자를 찾을 수 없음
      }
      throw new Error(`사용자 조회 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async save(userData: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 생성 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 업데이트 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new Error(`사용자 삭제 중 오류 발생: ${error.message}`);
    }
  }
}
