export interface Dictionary<T = any> { [key: string]: T }

export const WILD_CARD = "*"
export interface BHCoreOptions {
  readonly items: Item[]
  readonly properties: Property[]
  
  // readonly weapons: any
  readonly schema: {
    schemaVersion: string
    gameName: string
    player: Player
  }
}

export interface Player {
  inventory: PlayerInventory
}

export interface PlayerInventory { [key: string]: InventorySlotSchema }

export interface InventorySlotSchema {
  /**
   * Slot is unused right now, it could be used for recursive items, EG: A gun and it's attachment slots if they are nested, EG: a scope mount can add different scopes to the pool if items
   */
  // slots: string[]
  properties: string[]
}

export interface Item {
  id: string
  set: string
  slots: string[]
  properties: Dictionary[]
  tags: { [key: string]: boolean | string }[]
}

export interface Property {
  id: string
  max: number
  min: number
  slot_filters: string[] | undefined 
  category: string[] | undefined
  tags: string[] | undefined
}


// Everything is read only cause I can't allow myselft to fuck up with the references and memory like the previous project