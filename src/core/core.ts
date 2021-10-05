import { BHCoreOptions } from "./core.interface";
import { Inventory } from "./inventory/inventory";

class BHCore {
  public inventory: Inventory; 

  constructor(options: BHCoreOptions) {
    this.inventory = new Inventory(options.schema.player.inventory, options.items, options.properties)
  }
}

export { BHCore }