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
		const enLocale = require(`../db/locales/en.json`);
		const modPath = __dirname.split("\\").slice(0, -1).join("\\");
		
		//add retextures
		for (const categoryId in itemConfig) {
			for (const itemId in itemConfig[categoryId]) {
				// handle locale
				for (const localeID in database.locales.global) {
					
					// en placeholder
					if (enLocale[itemId]) {
						for (const localeItemEntry in enLocale[itemId]) {
							database.locales.global[localeID][`${itemId} ${localeItemEntry}`] = enLocale[itemId][localeItemEntry];
						}
					}
					// actual locale
					if (VFS.exists(`${modPath}locales\\${localeID}.json`) && localeID != "en") {
						const actualLocale = require(`../locales/${localeID}.json`);

						if (actualLocale[itemId]) {
							for (const localeItemEntry in actualLocale[itemId]) {
								database.locales.global[localeID][`${itemId} ${localeItemEntry}`] = actualLocale[itemId][localeItemEntry];
							}
						}
					}
					
					// replace some default locale
					if (VFS.exists(`${modPath}localesReplace\\${localeID}.json`)) {
						const replaceLocale = require(`../localesReplace/${localeID}.json`);
						
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