import { @Vigilant, @SwitchProperty, @SliderProperty, @SelectorProperty } from  "../Vigilance/index"

@Vigilant("Salvage")
class Settings {
    @SwitchProperty({
        name: "Toggle",
        category: "General",
    })
    toggle = true;

    @SliderProperty({
        name: "Crimson Essence Price",
        category: "General",
        min: 1,
        max: 4000,
    })
    crimsonEssencePrice = 2200;

    @SliderProperty({
        name: "Min Profit",
        category: "General",
        min: 0,
        max: 200_000,
    })
    min_profit = 50000;

    @SwitchProperty({
        name: "Add Stars/Tier to profit",
        category: "General",
    })
    stars = false;

    @SwitchProperty({
        name: "Add Kuudra Pet Perk to profit",
        category: "General",
    })
    kuudraPet = false;

    @SelectorProperty({
        name: "Kuudra Pet Tier",
        category: "General",
        options: ["COMMON", "UNCOMMON", "EPIC"],
    })
    kuudraPetTier = 0;

    @SwitchProperty({
        name: "Add Double Essence Perk to profit",
        category: "General",
    })
    doubleEssence = false;

    @SliderProperty({
        name: "Double Essence Tier",
        category: "General",
        min: 1,
        max: 5,
    })
    doubleEssenceTier = 5;

    @SwitchProperty({
        name: "Add profit to tooltip",
        category: "General",
    })
    tooltip_profit = false;

    constructor() {
        this.initialize(this);
        this.setCategoryDescription("General", "Salvage")
    }
}
export default new Settings();