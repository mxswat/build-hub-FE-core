import { Dictionary, Item, PlayerInventory, PlayerInventoryItem, Property, WILD_CARD } from "../core.interface";

export class Inventory {
  public slots: Dictionary<InventorySlot> = {}
  public static items: Item[] = []
  public static properties: Property[] = []
  constructor(inventory: PlayerInventory, items: Item[], properties: Property[]) {
    Inventory.items = items
    Inventory.properties = properties
    for (const slotID in inventory) {
      if (Object.prototype.hasOwnProperty.call(inventory, slotID)) {
        this.slots[slotID] = new InventorySlot(inventory[slotID], slotID);
      }
    }
  }

  /**
   * getSlots
   */
  public getSlots(): Dictionary<InventorySlot> {
    return this.slots
  }

}

export class InventorySlot {
  private properties: Dictionary<SlotProperty[]> = {}
  private propertiesDefault: Dictionary<any[]> = {}
  private item: any
  private id: string
  constructor(slot: PlayerInventoryItem, id: string) {
    this.id = id
    for (const iterator of slot.properties) {
      this.properties[iterator] = []
      this.propertiesDefault[iterator] = []
    }
  }

  public getAvailableItems(filter = (item: Item) => item.slots.includes(this.id)) {
    // Use default filter or custom one
    return Inventory.items.filter(filter)
  }

  public getItem() {
    return this.item
  }

  public setItem(item: Item) {
    this.properties = this.propertiesDefault
    for (let i = 0; i < item.properties.length; i++) {
      const element = item.properties[i];
      // Mx TODO yes, this fucking sucks it should be a tuple like [key, value] but who cares right now, right? right? pls send help
      const key = Object.keys(element)[0]
      if (this.properties[key]) {
        this.properties[key].push(new SlotProperty(key, element[key]))
      }
      // Sucks end
    }
    // TODO: Set item default prop if there is any :)
    this.item = item
  }

  public getPropertyByIndex(key: string, index: number): SlotProperty {
    if (!(this.properties?.[key]?.[index] ?? false)) {
      throw new Error(`there is no prop "${key}" at index "${index}" in the game_schema for the slot "${this.id}`);
    }
    return this.properties[key][index]
  }

  /**
   * To use on 
   * @param key 
   * @returns 
   */
  public getPropertyFirst(key: string): SlotProperty {
    return this.getPropertyByIndex(key, 0)
  }

  public getPropertyArray(key: string): SlotProperty[] {
    if (!(this.properties?.[key] ?? false)) {
      throw new Error(`there is no prop "${key}", is "${key}" in the game_schema for the slot "${this.id}"?`);
    }
    return this.properties[key]
  }
}

class SlotProperty {
  // because typescript 2.7.2 included a strict class checking where all properties should be declared in constructor. So to work around that, just add a bang sign (!) like: name!:string;
  // https://github.com/Microsoft/TypeScript-Vue-Starter/issues/36#issuecomment-371434263
  public readonly id!: string
  public readonly max!: number
  public readonly min!: number
  public readonly tags!: string[]
  public readonly isLocked!: boolean
  public readonly value!: number
  private filterId: string

  constructor(filterId: string, propId: string, ) {
    this.isLocked = !(propId === WILD_CARD)
    this.filterId = filterId

    if (propId !== WILD_CARD) {
      const property = Inventory.properties.find((x) => x.id === propId)
      if (property && property.filters.includes(filterId)) {
        this.setProperty(property)
      }
    }
  }

  /**
   * 
   * @param overrideFilter Warning! This overrides the filter entirelly! This means you need to check for the `filterId` unless you will get the props for a different slot, but this does not override if a prop is marked as locked
   * @returns Property
   */
  public getPossibleValues(overrideFilter?: (p: Property) => boolean): Property[] {
    if (this.isLocked) {
      return [Inventory.properties.find((p) => p.id === this.id) as Property]
    } else {
      const filter = overrideFilter ?? ((p) => p.filters.includes(this.filterId) && !p.tags.includes('is_hidden'))
      return Inventory.properties.filter(filter)
    }
  }

  public setProperty({id, max, min, tags}: Property) {
    (this.id as string) = id;
    (this.max as number) = max;
    (this.min as number) = min;
    (this.tags as string[]) = tags;
    (this.value as number) = max;
  }

  public setValue(value: number): number {
    if (this.id === WILD_CARD) throw new Error("You can't assing a value to a wildcard");
    // trick to set a readonly value from inside the class
    // https://github.com/microsoft/TypeScript/issues/37487#issuecomment-755645690
    (this.value as number) = value
    return value
  }
}