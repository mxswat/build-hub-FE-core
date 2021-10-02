import { BHCoreOptions } from "./core.interface";
import { Inventory } from "./inventory/inventory";

class BHCore {
  public inventory: Inventory; 

  constructor(options: BHCoreOptions) {
    this.inventory = new Inventory(options.schema.player.inventory, options.items, options.properties)
  }

  /**
   * So, if you know there are multiple properties of an item that share a key, you can use this function to get the values for it
   * @param item 
   * @param attributeKey 
   * @returns 
   */
  // public getItemAttributeValues<T>(item: IItem, attributeKey: string): Array<T> {
  //   const properties = item.properties.reduce((aggregator, attribute) => {
  //     const attributeValue = attribute[attributeKey]
  //     if (attributeValue) {
  //       aggregator.push(attribute[attributeKey] as any)
  //     }
  //     return aggregator
  //   }, [])

  //   return (properties as Array<T>)
  // }

  /**
   * So, if you know there is a single key for the attribute of an item , you can use this function to get the value for it
   * But if you want to be safe, use getItemAttributeValues
   * @param item 
   * @param attributeKey 
   * @returns 
   */
  // public getItemAttributeValue<T>(item: IItem, attributeKey: string): T {
  //   return this.getItemAttributeValues<T>(item, attributeKey)[0]
  // }
}

export { BHCore }