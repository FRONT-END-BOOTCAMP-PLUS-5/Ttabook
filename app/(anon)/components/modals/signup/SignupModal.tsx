import Modal from '@/ds/components/atoms/modal/Modal';
import InputField from '@/ds/components/molecules/inputField/InputField';
import styles from './SignupModal.module.css';
import Button from '@/ds/components/atoms/button/Button';
import { useState } from 'react';
import axios from 'axios';
import { isValidEmail, isValidPassword } from '@/utils/validation';
import { usePosts } from '@/hooks/usePosts';
import { useGets } from '@/hooks/useGets';
import { useSession } from '@/app/providers/SessionProvider';
import { useToastStore } from '@/hooks/useToast';

interface SignupModalProps {
  onClose: () => void;
}

const SignupModal = ({ onClose }: SignupModalProps) => {
  const { refreshSession } = useSession();
  const { showToast } = useToastStore();
  const onSuccess = () => {
    showToast('회원가입이 성공적으로 완료되었습니다!', 'primary');
    refreshSession();
    onClose();
  };
  const onError = (err: unknown) => {
    console.error('회원가입 실패:', err);
    if (axios.isAxiosError(err) && err.response?.data?.message) {
      console.log(err.response.data.message);
    } else {
      console.log('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [passwordCheckError, setPasswordCheckError] = useState('');
  const [checkedDuplication, setCheckedDuplication] = useState(false);
  const { mutate } = usePosts({
    onSuccess,
    onError,
  });
  const { refetchWithParams } = useGets<{
    available: boolean;
    message: string;
  }>(
    ['duplicates'],
    '/duplicates',
    false,
    {
      email: email,
    },
    undefined,
    { retry: false }
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isValidEmail(e.target.value)) {
      setEmailError('이메일 형식이 잘못되었습니다.');
    } else {
      setEmailError('');
    }
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isValidPassword(e.target.value)) {
      setPasswordError(
        '비밀번호는 영어, 특수문자, 숫자 조합의 8자 이상이어야 합니다.'
      );
    } else {
      setPasswordError('');
    }
    setPassword(e.target.value);
  };

  const handlePasswordCheckChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value !== password) {
      setPasswordCheckError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordCheckError('');
    }
    setPasswordCheck(e.target.value);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!checkedDuplication) {
      showToast('이메일 중복 확인은 필수입니다.', 'danger');
      return;
    }
    if (e.target.value?.length <= 0) {
      setNameError('이름은 필수값입니다.');
    } else {
      setNameError('');
    }
    setName(e.target.value);
  };

  const handleClickCheckDup = async () => {
    if (!isValidEmail(email)) {
      showToast('이메일 형식이 잘못되었습니다.', 'danger');
      return;
    }
    const { data, error } = await refetchWithParams({ email });

    if (data?.available === true && data?.message) {
      setCheckedDuplication(true);
      showToast(data?.message, 'secondary');
    }
    if (
      error &&
      axios.isAxiosError<{ available: boolean; message: string }>(error) &&
      error.response?.data?.available === false
    ) {
      showToast(error.response.data.message, 'danger');
    }
  };

  const handleClickSignup = () => {
    if (!name || !email || !password || !passwordCheck) {
      showToast('필수 값을 모두 입력하세요.', 'danger');
      return;
    }
    if (password !== passwordCheck) {
      showToast('비밀번호가 일치하지 않습니다.', 'danger');
      return;
    }
    if (isValidEmail(email) && isValidPassword(password)) {
      mutate({
        postData: {
          email,
          password,
          name,
        },
        path: '/signup',
      });
    }
  };

  return (
    <Modal height={600}>
      <Modal.Title>Signup</Modal.Title>
      <Modal.Body>
        <div className={styles['modal-container']}>
          <div className={styles['modal-input-container']}>
            <div className={styles['modal-input-absolute-parents']}>
              <InputField
                inputProps={{
                  _size: 'sm',
                  isFullWidth: true,
                  variant: 'primary',
                  placeholder: 'email을 입력하세요',
                  value: email,
                  onChange: handleEmailChange,
                  error: emailError,
                }}
                labelProps={{
                  variant: 'primary',
                  size: 'sm',
                  children: 'email',
                }}
                direction="column"
              />
              <div className={styles['modal-input-absolute']}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClickCheckDup}
                >
                  {' '}
                  중복확인
                </Button>
              </div>
            </div>
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                placeholder: '이름을 입력하세요',
                error: nameError,
                value: name,
                onChange: handleNameChange,
              }}
              labelProps={{
                variant: 'primary',
                size: 'sm',
                children: 'name',
              }}
              direction="column"
            />
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                placeholder: '비밀번호를 입력하세요',
                type: 'password',
                value: password,
                error: passwordError,
                onChange: handlePasswordChange,
              }}
              labelProps={{
                variant: 'primary',
                size: 'sm',
                children: 'password',
              }}
              direction="column"
            />
            <InputField
              inputProps={{
                _size: 'sm',
                isFullWidth: true,
                variant: 'primary',
                placeholder: '비밀번호를 다시 입력하세요',
                type: 'password',
                error: passwordCheckError,
                value: passwordCheck,
                onChange: handlePasswordCheckChange,
              }}
              labelProps={{
                variant: 'primary',
                size: 'sm',
                children: 'password check',
              }}
              direction="column"
            />
          </div>
          <div className={styles['modal-button-container']}>
            <Button size="md" isFullWidth={false} onClick={handleClickSignup}>
              회원가입
            </Button>
          </div>
        </div>
      </Modal.Body>
      <Modal.CloseButton onClick={onClose} />
    </Modal>
  );
};

export default SignupModal;
