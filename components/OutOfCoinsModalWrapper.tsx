'use client'

import { useApp } from '@/contexts/AppContext'
import { OutOfCoinsModal } from './OutOfCoinsModal'

export function OutOfCoinsModalWrapper() {
  const { showOutOfCoinsModal, setShowOutOfCoinsModal } = useApp()
  return (
    <OutOfCoinsModal
      isOpen={showOutOfCoinsModal}
      onClose={() => setShowOutOfCoinsModal(false)}
    />
  )
}
