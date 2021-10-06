export interface Dictionary<T = any> { [key: string]: T }

export const WILD_CARD = "*"

// For test purpose
export type DefaultSlotKeys = 'Something0' | 'Something1'

export type PlayerInventory<T extends string> = Record<T, InventorySlotSchema>

export interface InventorySlotSchema {
  /**
   * Slot is unused right now, it could be used for recursive items, EG: A gun and it's attachment slots if they are nested, EG: a scope mount can add different scopes to the pool if items
   */
  // slots: string[]
  properties: string[]
}

export interface Item {
  id: string
  set?: string
  slots?: string[]
  properties?: Dictionary[]
  tags?: string[]
}

export interface Property {
  id: string
  max?: number
  min?: number
  slot_filters?: string[]
  category?: string[]
  tags?: string[]
}


// Everything is read only cause I can't allow myselft to fuck up with the references and memory like the previous project