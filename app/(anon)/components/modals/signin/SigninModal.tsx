import Modal from '@/ds/components/atoms/modal/Modal';
import InputField from '@/ds/components/molecules/inputField/InputField';
import styles from './SigninModal.module.css';
import Button from '@/ds/components/atoms/button/Button';
import { CaptionText } from '@/ds/components/atoms/text/textWrapper';
import { useRef } from 'react';

interface SigninModalProps {
  onClose: (toggle: boolean) => void;
}
const SigninModal = ({ onClose }: SigninModalProps) => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const handleClickSignin = () => {
    console.log(emailRef.current?.value);
  };

  return (
    <Modal>
      <Modal.Title>Signin</Modal.Title>
      <Modal.Body>
        <div className={styles['modal-container']}>
          <div className={styles['modal-input-container']}>
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                placeholder: 'asdf',
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
            <Button size="md" isFullWidth={false} onClick={handleClickSignin}>
              로그인
            </Button>
            <div className={styles['modal-button-signup-container']}>
              <CaptionText size="sm" variant="disabled">
                아직 회원이 아니신가요?
              </CaptionText>
              <Button variant="ghost" size="sm" style={{ fontSize: 12 }}>
                회원가입
              </Button>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.CloseButton onClick={() => onClose(false)} />
    </Modal>
  );
};

export default SigninModal;
