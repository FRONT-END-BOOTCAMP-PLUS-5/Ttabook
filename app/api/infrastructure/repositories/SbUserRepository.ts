import { UserRepository } from '../../domain/repository/UserRepository';
import { User } from '../../domain/entities/User';
import { SignupRequest } from '../../auth/signup/application/dto/SignupRequest';
import { supabaseAdmin } from '../supabase/client';

export class SupabaseUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabaseAdmin
      .from('user')
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
    const { data, error } = await supabaseAdmin
      .from('user')
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

  async save(userData: SignupRequest): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('user')
      .insert([userData])
      .select()
      .single();

    if (error) {
      throw new Error(`사용자 생성 중 오류 발생: ${error.message}`);
    }

    return data;
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    const { data, error } = await supabaseAdmin
      .from('user')
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
    const { error } = await supabaseAdmin
      .from('user')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`사용자 삭제 중 오류 발생: ${error.message}`);
    }
  }
}