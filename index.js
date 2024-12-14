/// <reference types="../CTAutocomplete" />
/// <reference lib="es2015" />

import settings from "./config";
import { getSkyblockItemID, registerWhen, highlightSlot } from "../BloomCore/utils/Utils";
import ListFix from "../ListFix"

const items = ["CRIMSON", "AURORA", "TERROR", "FERVOR", "HOLLOW"]
var profit = {};
const slotRanges = [
    { start: 11, end: 16 },
    { start: 20, end: 25 },
    { start: 29, end: 34 },
    { start: 38, end: 43 }
];
const stars = [30,35,40,45,50,55,60,70,80,90,150,170,190,215,240,270,300,340,390,440,500,800,900,1000,1125,1270,1450,1850,2100,2350,2650,4500,5000,5600,6300,7000,8000,9000,10200,10500,13000,14500,25500,30000,35000,41000,48000,56000,65500,76000,89000,105000,120000,140000,165000,192000,225000,265000]

register("command", () => settings.openGUI()).setCommandName(`salvage`, true);

registerWhen(
    register("guiOpened", () => {
        Client.scheduleTask(5, () => {
            const container = Player?.getContainer();
            if (!container || !container.getName().startsWith("Auctions: ")) return;

            const cItems = container.getItems();
            profit = {};

            slotRanges.forEach(range => {
                for (let index = range.start; index <= range.end; index++) {
                    let item = cItems[index];
                    if (item) calculateProfit(item, index);     
                }
            });

            if (Object.keys(profit).length > 0) {
                highlight.register();
                close.register();
            }
        });
    }),
    () => settings.toggle
);

const highlight = register("guiRender", (mx, mt, gui) => {
    Object.keys(profit).forEach(index => {
        const { r, g, b } = profit[index];
        highlightSlot(gui, index, r, g, b, 1, true);
    }); 
}).unregister();

const close = register("guiClosed", () => {
    close.unregister();
    highlight.unregister();
}).unregister();

registerWhen(
    register(net.minecraftforge.event.entity.player.ItemTooltipEvent, event => {
        const item = new Item(event.itemStack);
        const sbID = getSkyblockItemID(item);
        if(!sbID) return;
    
        let profitValue = calculateProfit(item, null);
        if (profitValue != null)
            ListFix.add(event, "toolTip", `§6Salvage Profit: §b${profitValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`);
    }),
    () => settings.tooltip_profit
);

function calculateProfit(item, index) {
    const nbt = item?.getNBT() ?? item;
    const itemTag = nbt?.getCompoundTag("tag")?.toObject();
    const itemData = itemTag?.ExtraAttributes;
    const attributes = Object.keys(itemData?.attributes ?? {} );
    const itemLore = Object.values(itemTag?.display.Lore ?? [] );

    if (!attributes.length || !isRelevantItem(nbt)) return null;

    let attributeValue = attributes.reduce((sum, attribute) => sum + getAttributePrice(itemData.attributes[attribute]), 0);

    if (settings.stars) {
        const starTier = getStarTier(item);
        const totalEssence = stars.slice(0, starTier).reduce((sum, value) => sum + value, 0);
        attributeValue += Math.floor(totalEssence / 2);
    }
    if (settings.kuudraPet) {
        const kuudraMultipliers = [0.10, 0.15, 0.20];
        attributeValue *= 1 + kuudraMultipliers[settings.kuudraPetTier];
    }
    if (settings.doubleEssence) {
        attributeValue *= 1 + settings.doubleEssenceTier * 0.04;
    }

    const itemPrice = parseItemPrice(itemLore);
    if (itemPrice === null) return;

    const profitValue = attributeValue - itemPrice;
    if (index != null && profitValue > settings.min_profit) {
        profit[index] = { index, r: 0, g: 1, b: 0, };
    }
    return profitValue;
}

function parseItemPrice(lore) {
    for (let line of lore) {
        if (line.toString().includes("§7Buy it now: §6")) {
            const priceStr = line.split("§6")[1].split(" ")[0].replaceAll(",", "");
            return parseInt(priceStr, 10);
        }
    }
    return null;
}

function isRelevantItem(nbt) {
    const extraAttributes = nbt?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes");
    if (!extraAttributes) return false;
    const itemID = extraAttributes.getString("id");
    return items.some(item => itemID.includes(item));
}

//§dAncient Hot Crimson Helmet §d✪✪§6✪✪✪
//§dNecrotic Burning Aurora Leggings §d✪✪✪✪✪
function getStarTier(item) {
    let star = 0;
    const itemName = item.getName();

    if (itemName.includes("Hot")) star += 10;
    else if (itemName.includes("Burning")) star += 20;
    else if (itemName.includes("Fiery")) star += 30;
    else if (itemName.includes("Infernal")) star += 40;

    const regex = /§([d6])([✪]+)/g;
    let match;

    while ((match = regex.exec(itemName)) !== null) {
        const multiplier = match[1] === 'd' ? 2 : 1;
        star += multiplier * stars.length;
    }

    return star;
}

function getAttributePrice(attributeLevel) {
    return 10 * Math.pow(2, attributeLevel - 1) * settings.crimsonEssencePrice;
}