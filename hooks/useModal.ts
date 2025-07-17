'use client';
import { create } from 'zustand';

type ModalType = 'signin' | 'signup';

interface ModalState {
  openModals: ModalType[];
  openModal: (modal: ModalType) => void;
  closeModal: (modal: ModalType) => void;
  isModalOpen: (modal: ModalType) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  openModals: [],
  openModal: (modal) =>
    set((state) => ({
      openModals: [...state.openModals, modal],
    })),
  closeModal: (modal) =>
    set((state) => ({
      openModals: state.openModals.filter((m) => m !== modal),
    })),
  isModalOpen: (modal) => get().openModals.includes(modal),
}));
