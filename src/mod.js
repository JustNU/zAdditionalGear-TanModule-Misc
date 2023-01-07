"use strict";

class Mod
{
	
	postDBLoad(container) 
	{
		// Constants
		const logger = container.resolve("WinstonLogger");
		const database = container.resolve("DatabaseServer").getTables();
		const jsonUtil = container.resolve("JsonUtil");
		const core = container.resolve("JustNUCore");
		const VFS = container.resolve("VFS");
		const modDb = `user/mods/zAdditionalGear-TanModule-Misc/db/`;
		const config = require("../config/config.json");
		const itemConfig = require("../config/itemConfig.json");
		const itemData = require("../db/items/itemData.json");
		const enLocale = jsonUtil.deserialize(VFS.readFile(`${modDb}/locales/en.json`));
		
		//add retextures
		for (const categoryId in itemConfig) {
			for (const itemId in itemConfig[categoryId]) {
				// handle locale
				for (const localeID in database.locales.global) {
					
					// en placeholder
					if (enLocale[itemId]) {
						if (enLocale[itemId].Name)
							database.locales.global[localeID][`${itemId} Name`] = enLocale[itemId].Name;
						if (enLocale[itemId].ShortName)
							database.locales.global[localeID][`${itemId} ShortName`] = enLocale[itemId].ShortName;
						if (enLocale[itemId].Description)
							database.locales.global[localeID][`${itemId} Description`] = enLocale[itemId].Description;
					}
					// actual locale
					if (VFS.exists(`${modDb}/locales/${localeID}.json`) && localeID != "en") {
						const actualLocale = jsonUtil.deserialize(VFS.readFile(`${modDb}/locales/${localeID}.json`));

						if (actualLocale[itemId]) {
							if (actualLocale[itemId].Name)
								database.locales.global[localeID][`${itemId} Name`] = actualLocale[itemId].Name;
							if (actualLocale[itemId].ShortName)
								database.locales.global[localeID][`${itemId} ShortName`] = actualLocale[itemId].ShortName;
							if (actualLocale[itemId].Description)
								database.locales.global[localeID][`${itemId} Description`] = actualLocale[itemId].Description;
						}
					}
					
					// replace some default locale
					if (VFS.exists(`${modDb}/localesReplace/${localeID}.json`)) {
						const replaceLocale = jsonUtil.deserialize(VFS.readFile(`${modDb}/localesReplace/en.json`));
						
						for (const localeItem in replaceLocale) {
							for (const localeItemEntry in replaceLocale[localeItem]) {
								database.locales.global[localeID][`${localeItem} ${localeItemEntry}`] = replaceLocale[localeItem][localeItemEntry];
							}
						}
					}
					
				}
				
				// add item retexture that is 1:1 to original item
				if (itemConfig[categoryId][itemId]) {
					core.addItemRetexture(itemId, itemData[itemId].BaseItemID, itemData[itemId].BundlePath, config.EnableTradeOffers, config.AddToBots, itemData[itemId].LootWeigthMult);
				}
			}
		}
		
		// Modify quests
		if (config.EnableQuestChanges) {
			const punisher4Gear = [
				["572b7adb24597762ae139821", "AddGearTan_CFBalaclava"],
				["572b7adb24597762ae139821", "AddGearTan_MomexBalaclava"]
			];
			
			// The Punisher - Part 4
			if (database.templates.quests["59ca264786f77445a80ed044"]) {
				const thePunisher4Gear = database.templates.quests["59ca264786f77445a80ed044"].conditions.AvailableForFinish[1]._props.counter.conditions[2]._props.equipmentInclusive;
				
				database.templates.quests["59ca264786f77445a80ed044"].conditions.AvailableForFinish[1]._props.counter.conditions[2]._props.equipmentInclusive = [
					...jsonUtil.clone(thePunisher4Gear),
					...punisher4Gear
				];
			}
		}
	}
}

module.exports = { mod: new Mod() }