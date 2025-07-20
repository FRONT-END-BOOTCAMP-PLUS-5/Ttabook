import Modal from '@/ds/components/atoms/modal/Modal';
import InputField from '@/ds/components/molecules/inputField/InputField';
import styles from './SigninModal.module.css';
import Button from '@/ds/components/atoms/button/Button';
import { CaptionText } from '@/ds/components/atoms/text/textWrapper';
import { useRef } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useSession } from '@/app/providers/SessionProvider';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/hooks/useToast';

interface SigninModalProps {
  onClose: () => void;
  openSignup: () => void;
}
const SigninModal = ({ onClose, openSignup }: SigninModalProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { refreshSession } = useSession();
  const router = useRouter();
  const { showToast } = useToastStore();
  const onSuccess = (data: {
    message: string;
    success: boolean;
    user: {
      email: string;
      id: string;
      name: string;
      type: string;
    };
  }) => {
    refreshSession();
    if (data.user.type === 'admin') {
      router.push('/admin');
      return;
    }
    onClose();
  };
  const onError = () => {
    showToast('아이디 또는 비밀번호 오류!', 'accent');
  };
  const { mutate } = usePosts({ onSuccess, onError });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailRef.current?.value && passwordRef.current?.value) {
      mutate({
        postData: {
          email: emailRef.current?.value,
          password: passwordRef.current?.value,
        },
        path: '/signin',
      });
    }
  };


  const handleClickSignup = () => {
    onClose();
    openSignup();
  };

  return (
    <Modal>
      <Modal.Title>Signin</Modal.Title>
      <Modal.Body>
        <form className={styles['modal-container']} onSubmit={handleSubmit}>
          <div className={styles['modal-input-container']}>
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                ref: emailRef,
              }}
              labelProps={{
                variant: 'primary',
                size: 'sm',
                children: 'email',
              }}
              direction="column"
            />
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                type: 'password',
                ref: passwordRef,
              }}
              labelProps={{
                variant: 'primary',
                size: 'sm',
                children: 'password',
              }}
              direction="column"
            />
          </div>
          <div className={styles['modal-button-container']}>
            <Button size="md" isFullWidth={false} type="submit">
              로그인
            </Button>
            <div className={styles['modal-button-signup-container']}>
              <CaptionText size="sm" variant="disabled">
                아직 회원이 아니신가요?
              </CaptionText>
              <Button
                variant="ghost"
                size="sm"
                style={{ fontSize: 12 }}
                onClick={handleClickSignup}
                type="button"
              >
                회원가입
              </Button>
            </div>
          </div>
        </form>
      </Modal.Body>
      <Modal.CloseButton onClick={() => onClose()} />
    </Modal>
  );
};

export default SigninModal;
