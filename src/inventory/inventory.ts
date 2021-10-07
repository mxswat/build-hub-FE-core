import {
  Dictionary,
  InventorySlotSchema,
  Item,
  PlayerInventory,
  Property,
  Set,
  WILD_CARD,
} from "./inventory.interface";

export class Inventory<SlotKeys extends string> {
  public readonly slots: Record<SlotKeys, InventorySlot> = {} as any
  public static readonly items: Item[]
  public static readonly properties: Property[]
  public static readonly sets: Set[]
  constructor(inventory: PlayerInventory<SlotKeys>, items: Item[], properties: Property[], sets: Set[]) {
    (Inventory.items as Item[]) = items;
    (Inventory.properties as Property[]) = properties;
    (Inventory.sets as Set[]) = sets;

    for (const slotID in inventory) {
      if (Object.prototype.hasOwnProperty.call(inventory, slotID)) {
        this.slots[slotID] = new InventorySlot(inventory[slotID], slotID);
      }
    }
  }

  public getCombinedProperties(slots: SlotKeys[]) {
    for (let i = 0; i < slots.length; i++) {
      const slotId = slots[i];
      if (this.slots[slotId].hasItem()) {
        
      }
    }
  }
}

export class InventorySlot {
  private properties: Dictionary<SlotProperty[]> = {}
  private propertiesDefault: Dictionary<any[]> = {}
  private item: any
  private id: string

  constructor(slot: InventorySlotSchema, id: string) {
    this.id = id
    for (const iterator of slot.properties) {
      this.properties[iterator] = []
      this.propertiesDefault[iterator] = []
    }
  }

  private checkForitem() {
    if (!this.item) throw new Error("this.item is not defined! You need to set it to something before editing the properties");
  }

  public getAvailableItems(filter = (item: Item) => (item.slots || []).includes(this.id)) {
    // Use default filter or custom one
    return Inventory.items.filter(filter)
  }

  public hasItem() {
    return !!this.item 
  }

  public getItem() {
    return this.item
  }

  public setItem(item: Item) {
    this.properties = this.propertiesDefault
    const properties = item.properties || []
    for (let i = 0; i < properties.length; i++) {
      const element = properties[i];
      // Mx TODO yes, this fucking sucks it should be a tuple like [key, value] but who cares right now, right? right? pls send help
      const key = Object.keys(element)[0]
      if (this.properties[key]) {
        this.properties[key].push(new SlotProperty(key, element[key], this.id))
      }
      // Sucks end
    }
    this.item = item
  }

  public getItemPropertyByIndex(key: string, index: number): SlotProperty {
    this.checkForitem()
    if (!(this.properties?.[key]?.[index] ?? false)) {
      throw new Error(`there is no prop "${key}" at index "${index}" in the game_schema for the slot "${this.id}`);
    }
    return this.properties[key][index]
  }

  public getItemPropertyFirst(key: string): SlotProperty {
    this.checkForitem()
    return this.getItemPropertyByIndex(key, 0)
  }

  public getItemPropertyArray(key: string): SlotProperty[] {
    this.checkForitem()
    if (!(this.properties?.[key] ?? false)) {
      throw new Error(`there is no prop "${key}", is "${key}" in the game_schema for the slot "${this.id}"?`);
    }
    return this.properties[key]
  }

  public getAllProperties() {
    return this.properties
  }
}

class SlotProperty {
  // because typescript 2.7.2 included a strict class checking where all properties should be declared in constructor. So to work around that, just add a bang sign (!) like: name!:string;
  // https://github.com/Microsoft/TypeScript-Vue-Starter/issues/36#issuecomment-371434263
  public readonly id!: string
  public readonly max!: number
  public readonly min!: number
  public readonly tags!: string[]
  public readonly value!: number
  private categoryId: string
  private slotId: string
  private isLocked!: boolean
  // private isReadonly!: boolean

  constructor(categoryId: string, propertyId: string, parentSlotId: string) {
    this.isLocked = !(propertyId === WILD_CARD)
    this.categoryId = categoryId
    this.slotId = parentSlotId

    if (propertyId !== WILD_CARD) {
      const property = Inventory.properties.find(
        (x) => x.id === propertyId
          && x.category?.includes(categoryId)
      )
      if (property && property?.category?.includes(categoryId)) {
        this.setPropertyInner(property)
      } else {
        (this.value as any) = propertyId;
        // There is no property found for this slot
        // Assume is a readOnly value
      }
    }
  }

  private possibleValuesFilter({ tags, slot_filters, category }: Property): boolean {
    if (tags && tags.includes('is_hidden')) return false // Always exclude if hidden
    if (slot_filters && !slot_filters.includes(this.slotId)) return false
    if (category && !category.includes(this.categoryId)) return false
    return true
  }

  /**
   * 
   * @param overrideFilter Warning! This overrides the filter entirelly!
   * @returns Property
   */
  public getPossibleValues(overrideFilter?: (p: Property) => boolean): Property[] {
    if (this.isLocked) {
      return [Inventory.properties.find((p) => p.id === this.id) as Property]
    } else {
      const filter = overrideFilter ?? this.possibleValuesFilter.bind(this)
      return Inventory.properties.filter(filter)
    }
  }

  private setPropertyInner({ id, max, min, tags }: Property) {
    (this.id as string) = id;
    (this.max as number) = max as unknown as number;
    (this.min as number) = min as unknown as number;
    (this.tags as string[]) = tags ?? [];
    (this.value as number) = max as unknown as number;
  }

  public changeProperty(property: Property) {
    if (this.isLocked) throw new Error(`The property ${this.id} in slot ${this.slotId} is locked and you cant replace it`);
    this.setPropertyInner(property)
  }

  public setValue(value: number): number {
    if (this.id === WILD_CARD) throw new Error("You can't assing a value to a wildcard");
    // trick to set a readonly value from inside the class
    // https://github.com/microsoft/TypeScript/issues/37487#issuecomment-755645690
    (this.value as number) = value
    return value
  }
}