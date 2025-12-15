/*
 * Copyright 2020, OpenRemote Inc.
 *
 * See the CONTRIBUTORS.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
package org.openremote.model.asset.impl;

import org.openremote.model.asset.Asset;
import org.openremote.model.asset.AssetDescriptor;
import org.openremote.model.attribute.MetaItem;
import org.openremote.model.value.*;
import org.openremote.model.value.impl.ColourRGB;

import jakarta.persistence.Entity;
import java.util.Optional;

import static org.openremote.model.Constants.*;

@Entity
public class LightAsset extends Asset<LightAsset> {

    public static final AttributeDescriptor<Boolean> ON_OFF = new AttributeDescriptor<>("status2", ValueType.BOOLEAN).withFormat(ValueFormat.BOOLEAN_ON_OFF());
    public static final AttributeDescriptor<Integer> BRIGHTNESS = new AttributeDescriptor<>("brightness", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_WRITE)
    )
            .withUnits(UNITS_PERCENTAGE)
            .withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(100))
            .withFormat(new ValueFormat().setAsSlider(true));
    public static final AttributeDescriptor<ColourRGB> COLOUR_RGB = new AttributeDescriptor<>("colourRGB", ValueType.COLOUR_RGB);
    public static final AttributeDescriptor<Integer> COLOUR_TEMPERATURE = new AttributeDescriptor<>("colourTemperature", ValueType.POSITIVE_INTEGER)
            .withUnits(UNITS_KELVIN).withConstraints(new ValueConstraint.Min(1000), new ValueConstraint.Max(10000));
    //hid viet begin
    public static final AttributeDescriptor<Double> AMPERAGE = new AttributeDescriptor<>("amperage", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)

    )
            .withUnits(UNITS_MILLI,UNITS_AMP).withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(1000000));
    public static final AttributeDescriptor<Double> WATTAGEACTUAL = new AttributeDescriptor<>("wattageActual", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT,UNITS_HOUR).withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(1000000));


    public static final AttributeDescriptor<Double> WATTAGE = new AttributeDescriptor<>("wattage", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT).withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(1000000));


    public static final AttributeDescriptor<Double> VOLTAGE = new AttributeDescriptor<>("voltage", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_VOLT).withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(1000000));

    public static final AttributeDescriptor<String> ASSET_START = new AttributeDescriptor<>("assetStatus", ValueType.TEXT
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );

    public Optional<String> getAssetStatus() {
        return getAttributes().getValue(ASSET_START);
    }

    public LightAsset setAssetStatus(String value) {
        getAttributes().getOrCreate(ASSET_START).setValue(value);
        return this;
    }
    //hdi viet end
    public static final AssetDescriptor<LightAsset> DESCRIPTOR = new AssetDescriptor<>("lightbulb", "336666", LightAsset.class);

    /**
     * For use by hydrators (i.e. JPA/Jackson)
     */
    public LightAsset() {
    }

    public LightAsset(String name) {
        super(name);
    }

    public Optional<Boolean> getOnOff() {
        return getAttributes().getValue(ON_OFF);
    }

    public LightAsset setOnOff(Boolean value) {
        getAttributes().getOrCreate(ON_OFF).setValue(value);
        return this;
    }

    public Optional<Integer> getBrightness() {
        return getAttributes().getValue(BRIGHTNESS);
    }

    public LightAsset setBrightness(Integer value) {
        getAttributes().getOrCreate(BRIGHTNESS).setValue(value);
        return this;
    }

    public Optional<ColourRGB> getColourRGB() {
        return getAttributes().getValue(COLOUR_RGB);
    }

    public LightAsset setColourRGB(ColourRGB value) {
        getAttributes().getOrCreate(COLOUR_RGB).setValue(value);
        return this;
    }

    public Optional<Integer> getTemperature() {
        return getAttributes().getValue(COLOUR_TEMPERATURE);
    }

    public LightAsset setTemperature(Integer value) {
        getAttributes().getOrCreate(COLOUR_TEMPERATURE).setValue(value);
        return this;
    }
    //hid viet begin

    public Optional<Double> getAmperage() {
        return getAttributes().getValue(AMPERAGE);
    }
    public LightAsset setAmperage(Double value) {
        getAttributes().getOrCreate(AMPERAGE).setValue(value);
        return this;
    }

    public Optional<Double> getWattageActual() {
        return getAttributes().getValue(WATTAGEACTUAL);
    }
    public LightAsset setWattageActual(Double value) {
        getAttributes().getOrCreate(WATTAGEACTUAL).setValue(value);
        return this;
    }

    public Optional<Double> getWattage() {
        return getAttributes().getValue(WATTAGE);
    }
    public LightAsset setWattage(Double value) {
        getAttributes().getOrCreate(WATTAGE).setValue(value);
        return this;
    }

    public Optional<Double> getVoltage() {
        return getAttributes().getValue(VOLTAGE);
    }
    public LightAsset setVoltage(Double value) {
        getAttributes().getOrCreate(VOLTAGE).setValue(value);
        return this;
    }
    //hid viet end
}
