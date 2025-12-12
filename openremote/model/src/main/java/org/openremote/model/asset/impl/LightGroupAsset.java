package org.openremote.model.asset.impl;


import jakarta.persistence.Entity;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.AssetDescriptor;
import org.openremote.model.attribute.MetaItem;
import org.openremote.model.value.*;

import java.util.Optional;

import static org.openremote.model.Constants.UNITS_KELVIN;
import static org.openremote.model.Constants.UNITS_PERCENTAGE;

@Entity
public class LightGroupAsset extends Asset<LightGroupAsset> {
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

    public static final AssetDescriptor<LightGroupAsset> DESCRIPTOR = new AssetDescriptor<>("lightbulb-group-outline", "e6688a", LightGroupAsset.class);
    protected LightGroupAsset() {}
    public LightGroupAsset(String name) {
        super(name);
    }

    public Optional<Boolean> getOnStatus() {
        return getAttributes().getValue(Status);
    }
    public LightGroupAsset setStatus(Boolean value) {
        getAttributes().getOrCreate(Status).setValue(value);
        return this;
    }

    public Optional<Integer> getBrightness() {
        return getAttributes().getValue(BRIGHTNESS);
    }
    public LightGroupAsset setBrightness(Integer value) {
        getAttributes().getOrCreate(BRIGHTNESS).setValue(value);
        return this;
    }

    public Optional<Integer> getTemperature() {
        return getAttributes().getValue(COLOUR_TEMPERATURE);
    }
    public LightGroupAsset setTemperature(Integer value) {
        getAttributes().getOrCreate(COLOUR_TEMPERATURE).setValue(value);
        return this;
    }

}
