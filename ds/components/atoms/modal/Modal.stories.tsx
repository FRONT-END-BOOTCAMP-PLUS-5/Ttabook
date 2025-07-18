import type { Meta, StoryObj } from '@storybook/nextjs';
import { fn } from 'storybook/test';
import Modal from './Modal';

const meta = {
  title: 'Components/Atoms/Modal',
  component: Modal,
  subcomponents: {
    'Modal.Title': Modal.Title,
    'Modal.Body': Modal.Body,
    'Modal.CloseButton': Modal.CloseButton,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A flexible modal component with compound pattern for composable content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 200, max: 800, step: 50 },
      description: 'Modal width in pixels',
    },
    height: {
      control: { type: 'number', min: 200, max: 600, step: 50 },
      description: 'Modal height in pixels',
    },
    isOpen: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    onClose: {
      action: 'closed',
      description: 'Function called when modal is closed',
    },
  },
  args: {
    onClose: fn(),
    isOpen: true,
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    width: 400,
    height: 300,
    children: (
      <>
        <Modal.Title>Basic Modal</Modal.Title>
        <Modal.Body>
          <p>This is a basic modal with title and body content.</p>
        </Modal.Body>
        <Modal.CloseButton />
      </>
    ),
  },
};

export const SignUpForm: Story = {
  args: {
    width: 400,
    height: 500,
    children: (
      <>
        <Modal.Title>Sign Up</Modal.Title>
        <Modal.Body>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                style={{ width: '70px', fontSize: '14px', fontWeight: '500' }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="이메일 입력"
                style={{
                  width: '250px',
                  padding: '14px 18px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
              <button
                style={{
                  padding: '8px 16px',
                  background: 'white',
                  border: '2px solid #B8D4A8',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                중복 확인
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                style={{ width: '70px', fontSize: '14px', fontWeight: '500' }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="비밀번호 입력"
                style={{
                  width: '250px',
                  padding: '14px 18px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label
                style={{ width: '70px', fontSize: '14px', fontWeight: '500' }}
              >
                Confirm
              </label>
              <input
                type="password"
                placeholder="비밀 번호 확인"
                style={{
                  width: '250px',
                  padding: '14px 18px',
                  border: '2px solid #E2E8F0',
                  borderRadius: '12px',
                  fontSize: '13px',
                }}
              />
            </div>
            <button
              style={{
                width: '130px',
                padding: '14px 24px',
                background: 'linear-gradient(164deg, #B8D4A8 0%, #9BB89A 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                color: '#2D3748',
                cursor: 'pointer',
                alignSelf: 'center',
                marginTop: '20px',
              }}
            >
              회원 가입
            </button>
          </div>
        </Modal.Body>
        <Modal.CloseButton />
      </>
    ),
  },
};

export const Large: Story = {
  args: {
    width: 600,
    height: 400,
    children: (
      <>
        <Modal.Title>Large Modal</Modal.Title>
        <Modal.Body>
          <div>
            <h3>Large Content Area</h3>
            <p>This modal demonstrates a larger size configuration.</p>
            <p>
              You can put more content here, including forms, images, or any
              other components.
            </p>
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
              <li>Feature 3</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.CloseButton />
      </>
    ),
  },
};

export const Small: Story = {
  args: {
    width: 300,
    height: 200,
    children: (
      <>
        <Modal.Title>Confirm</Modal.Title>
        <Modal.Body>
          <p>Are you sure you want to delete this item?</p>
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              marginTop: '20px',
            }}
          >
            <button
              style={{
                padding: '8px 16px',
                background: '#e87a74',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
              }}
            >
              Delete
            </button>
            <button
              style={{
                padding: '8px 16px',
                background: '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
              }}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
        <Modal.CloseButton />
      </>
    ),
  },
};

export const WithoutCloseButton: Story = {
  args: {
    width: 350,
    height: 250,
    children: (
      <>
        <Modal.Title>Important Notice</Modal.Title>
        <Modal.Body>
          <p>
            This modal requires explicit action and cannot be closed with the X
            button.
          </p>
          <button
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#B8D4A8',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
            onClick={() => window.alert('Action completed!')}
          >
            I Understand
          </button>
        </Modal.Body>
      </>
    ),
  },
};

export const ContentOverflow: Story = {
  args: {
    width: 400,
    height: 300,
    children: (
      <>
        <Modal.Title>Scrollable Content</Modal.Title>
        <Modal.Body>
          <div>
            <h3>Long Content</h3>
            {Array.from({ length: 20 }, (_, i) => (
              <p key={i}>
                This is paragraph {i + 1}. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua.
              </p>
            ))}
          </div>
        </Modal.Body>
        <Modal.CloseButton />
      </>
    ),
  },
};
