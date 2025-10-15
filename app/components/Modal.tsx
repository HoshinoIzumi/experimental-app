'use client'
import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  modalOpen: boolean
  setModalOpen: (v: boolean) => void
  children: React.ReactNode
  closeOnBackdrop?: boolean
}

export default function Modal({
  modalOpen,
  setModalOpen,
  children,
  closeOnBackdrop = true,
}: ModalProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const onClose = () => setModalOpen(false)

  return createPortal(
    <div
      className={`modal ${modalOpen ? 'modal-open' : ''}`}
      onClick={closeOnBackdrop ? onClose : undefined}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>,
    document.body
  )
}
