package org.openremote.model.asset.impl;

import jakarta.persistence.Entity;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.AssetDescriptor;
import org.openremote.model.attribute.AttributeMap;
import org.openremote.model.attribute.MetaItem;
import org.openremote.model.value.*;

import java.util.Date;
import java.util.Optional;

import static org.openremote.model.Constants.*;

@Entity
public class ElectricalCabinetAsset extends Asset<ElectricalCabinetAsset> {
    public static final AttributeDescriptor<Boolean> Status = new AttributeDescriptor<>("status", ValueType.BOOLEAN).withFormat(ValueFormat.BOOLEAN_ON_OFF());
    public static final AttributeDescriptor<Integer> BRIGHTNESS = new AttributeDescriptor<>("brightness", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_WRITE)
    )
            .withUnits(UNITS_PERCENTAGE)
            .withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(100))
            .withFormat(new ValueFormat().setAsSlider(true));
    public static final AttributeDescriptor<Integer> COLOUR_TEMPERATURE = new AttributeDescriptor<>("colourTemperature", ValueType.POSITIVE_INTEGER)
            .withUnits(UNITS_KELVIN).withConstraints(new ValueConstraint.Min(1000), new ValueConstraint.Max(10000));
    //hid viet begin
    public static final AttributeDescriptor<Double> AMPERAGE1 = new AttributeDescriptor<>("amperagePhase1", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_MILLI,UNITS_AMP);
    public static final AttributeDescriptor<Double> WATTAGEACTUAL1 = new AttributeDescriptor<>("wattageActualPhase1", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT,UNITS_HOUR);
    public static final AttributeDescriptor<Double> WATTAGE1 = new AttributeDescriptor<>("wattagePhase1", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT);
    public static final AttributeDescriptor<Double> VOLTAGE1 = new AttributeDescriptor<>("voltagePhase1", ValueType.NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_VOLT);

    public static final AttributeDescriptor<Double> AMPERAGE2 = new AttributeDescriptor<>("amperagePhase2", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_MILLI,UNITS_AMP);
    public static final AttributeDescriptor<Double> WATTAGEACTUAL2= new AttributeDescriptor<>("wattageActualPhase2", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT,UNITS_HOUR);
    public static final AttributeDescriptor<Double> WATTAGE2= new AttributeDescriptor<>("wattagePhase2", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT);
    public static final AttributeDescriptor<Double> VOLTAGE2 = new AttributeDescriptor<>("voltagePhase2", ValueType.NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_VOLT);

    public static final AttributeDescriptor<Double> AMPERAGE3 = new AttributeDescriptor<>("amperagePhase3", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_MILLI,UNITS_AMP);
    public static final AttributeDescriptor<Double> WATTAGEACTUAL3 = new AttributeDescriptor<>("wattageActualPhase3", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT,UNITS_HOUR);
    public static final AttributeDescriptor<Double> WATTAGE3 = new AttributeDescriptor<>("wattagePhase3", ValueType.POSITIVE_NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_WATT);
    public static final AttributeDescriptor<Double> VOLTAGE3 = new AttributeDescriptor<>("voltagePhase3", ValueType.NUMBER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    )
            .withUnits(UNITS_VOLT);

    public static final AttributeDescriptor<Integer> POWERSTS1 = new AttributeDescriptor<>("power_sts_1", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );

    public static final AttributeDescriptor<Integer> POWERSTS2 = new AttributeDescriptor<>("power_sts_2", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );


    public static final AttributeDescriptor<Integer> POWERSTS3 = new AttributeDescriptor<>("power_sts_3", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );

    public static final AttributeDescriptor<Integer> POWERSTS4 = new AttributeDescriptor<>("power_sts_4", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );

    public static final AttributeDescriptor<String> ASSET_START = new AttributeDescriptor<>("assetStatus", ValueType.TEXT
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
            ,new MetaItem<>(MetaItemType.READ_ONLY)
            ,new MetaItem<>(MetaItemType.ACCESS_RESTRICTED_READ)
    );


    //hdi viet end
    public static final AssetDescriptor<ElectricalCabinetAsset> DESCRIPTOR = new AssetDescriptor<>("file-cabinet", "EABB4D", ElectricalCabinetAsset.class);

    public ElectricalCabinetAsset() {}
    public ElectricalCabinetAsset(String name) {
        super(name);
    }

    public Optional<Boolean> getOnStatus() {
        return getAttributes().getValue(Status);
    }
    public ElectricalCabinetAsset setStatus(Boolean value) {
        getAttributes().getOrCreate(Status).setValue(value);
        return this;
    }

    public Optional<String> getAssetStatus() {
        return getAttributes().getValue(ASSET_START);
    }

    public ElectricalCabinetAsset setAssetStatus(String value) {
        getAttributes().getOrCreate(ASSET_START).setValue(value);
        return this;
    }

    public Optional<Integer> getBrightness() {
        return getAttributes().getValue(BRIGHTNESS);
    }
    public ElectricalCabinetAsset setBrightness(Integer value) {
        getAttributes().getOrCreate(BRIGHTNESS).setValue(value);
        return this;
    }

    public Optional<Integer> getTemperature() {
        return getAttributes().getValue(COLOUR_TEMPERATURE);
    }
    public ElectricalCabinetAsset setTemperature(Integer value) {
        getAttributes().getOrCreate(COLOUR_TEMPERATURE).setValue(value);
        return this;
    }
    //hid viet begin
    public Optional<Double> getAmperage1() {
        return getAttributes().getValue(AMPERAGE1);
    }
    public ElectricalCabinetAsset setAmperage1(Double value) {
        getAttributes().getOrCreate(AMPERAGE1).setValue(value);
        return this;
    }

    public Optional<Double> getWattageActual1() {
        return getAttributes().getValue(WATTAGEACTUAL1);
    }
    public ElectricalCabinetAsset setWattageActual1(Double value) {
        getAttributes().getOrCreate(WATTAGEACTUAL1).setValue(value);
        return this;
    }
    public Optional<Double> getWattage1() {
        return getAttributes().getValue(WATTAGE1);
    }
    public ElectricalCabinetAsset setWattage1(Double value) {
        getAttributes().getOrCreate(WATTAGE1).setValue(value);
        return this;
    }

    public Optional<Double> getVoltage1() {
        return getAttributes().getValue(VOLTAGE1);
    }
    public ElectricalCabinetAsset setVoltage1(Double value) {
        getAttributes().getOrCreate(VOLTAGE1).setValue(value);
        return this;
    }

    //
    public Optional<Double> getAmperage2() {
        return getAttributes().getValue(AMPERAGE2);
    }
    public ElectricalCabinetAsset setAmperage2(Double value) {
        getAttributes().getOrCreate(AMPERAGE2).setValue(value);
        return this;
    }

    public Optional<Double> getWattageActual2() {
        return getAttributes().getValue(WATTAGEACTUAL2);
    }
    public ElectricalCabinetAsset setWattageActual2(Double value) {
        getAttributes().getOrCreate(WATTAGEACTUAL2).setValue(value);
        return this;
    }
    public Optional<Double> getWatt2() {
        return getAttributes().getValue(WATTAGE2);
    }
    public ElectricalCabinetAsset setWattage2(Double value) {
        getAttributes().getOrCreate(WATTAGE2).setValue(value);
        return this;
    }

    public Optional<Double> getVoltage2() {
        return getAttributes().getValue(VOLTAGE2);
    }
    public ElectricalCabinetAsset setVoltage2(Double value) {
        getAttributes().getOrCreate(VOLTAGE2).setValue(value);
        return this;
    }

    //
    public Optional<Double> getAmperage3() {
        return getAttributes().getValue(AMPERAGE3);
    }
    public ElectricalCabinetAsset setAmperage3(Double value) {
        getAttributes().getOrCreate(AMPERAGE3).setValue(value);
        return this;
    }

    public Optional<Double> getWattageActual3() {
        return getAttributes().getValue(WATTAGEACTUAL3);
    }
    public ElectricalCabinetAsset setWattageActual3(Double value) {
        getAttributes().getOrCreate(WATTAGEACTUAL3).setValue(value);
        return this;
    }
    public Optional<Double> getWattage3() {
        return getAttributes().getValue(WATTAGE3);
    }
    public ElectricalCabinetAsset setWattage3(Double value) {
        getAttributes().getOrCreate(WATTAGE3).setValue(value);
        return this;
    }

    public Optional<Double> getVoltage3() {
        return getAttributes().getValue(VOLTAGE3);
    }
    public ElectricalCabinetAsset setVoltage3(Double value) {
        getAttributes().getOrCreate(VOLTAGE3).setValue(value);
        return this;
    }
    //hid viet end

    public Optional<Integer> getPowersts1() {
        return getAttributes().getValue(POWERSTS1);
    }
    public ElectricalCabinetAsset setPowersts1(Integer value) {
        getAttributes().getOrCreate(POWERSTS1).setValue(value);
        return this;
    }

    public Optional<Integer> getPowersts2() {
        return getAttributes().getValue(POWERSTS2);
    }
    public ElectricalCabinetAsset setPowersts2(Integer value) {
        getAttributes().getOrCreate(POWERSTS2).setValue(value);
        return this;
    }

    public Optional<Integer> getPowersts3() {
        return getAttributes().getValue(POWERSTS3);
    }
    public ElectricalCabinetAsset setPowersts3(Integer value) {
        getAttributes().getOrCreate(POWERSTS3).setValue(value);
        return this;
    }

    public Optional<Integer> getPowersts4() {
        return getAttributes().getValue(POWERSTS4);
    }
    public ElectricalCabinetAsset setPowersts4(Integer value) {
        getAttributes().getOrCreate(POWERSTS4).setValue(value);
        return this;
    }


    public ElectricalCabinetAsset(String id, AttributeMap attributes, Date createdOn, String name, String parentId, String[] path, String realm, String type, boolean accessPublicRead, long version, String status, String address, String assetModel) {
        super(id, attributes, createdOn, name, parentId, path, realm, type, accessPublicRead, version);
    }

}
