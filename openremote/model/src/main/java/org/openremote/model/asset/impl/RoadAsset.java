package org.openremote.model.asset.impl;


import jakarta.persistence.Entity;
import org.openremote.model.asset.Asset;
import org.openremote.model.asset.AssetDescriptor;
import org.openremote.model.attribute.MetaItem;
import org.openremote.model.value.*;

import java.util.Optional;

import static org.openremote.model.Constants.*;

@Entity
public class RoadAsset extends Asset<RoadAsset> {
    public static final AttributeDescriptor<Integer> BRIGHTNESS = new AttributeDescriptor<>("brightness", ValueType.POSITIVE_INTEGER
            ,new MetaItem<>(MetaItemType.RULE_STATE)
            ,new MetaItem<>(MetaItemType.STORE_DATA_POINTS)
    )
            .withUnits(UNITS_PERCENTAGE)
            .withConstraints(new ValueConstraint.Min(0), new ValueConstraint.Max(100))
            .withFormat(new ValueFormat().setAsSlider(true));
    public static final AssetDescriptor<RoadAsset> DESCRIPTOR = new AssetDescriptor<>("road-variant", "220000", RoadAsset.class);
    protected RoadAsset() {}
    public RoadAsset(String name) {
        super(name);
    }

    public Optional<Integer> getBrightness() {
        return getAttributes().getValue(BRIGHTNESS);
    }
    public RoadAsset setBrightness(Integer value) {
        getAttributes().getOrCreate(BRIGHTNESS).setValue(value);
        return this;
    }


}
