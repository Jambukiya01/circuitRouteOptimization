import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { Colors, Fonts } from '../../constants';
import { PackageFinderData, PackageFinderHeightPosition, PackageFinderHorizontal, PackageFinderLeftRight, PackageFinderSize, PackageFinderType } from '../../model/LocationModel';
import { useTheme } from '../../context/ThemeContext';

interface PackageFinderProps {
    initialData?: PackageFinderData;
    onSave: (data: PackageFinderData) => void;
    onClose: () => void;
}

const PackageFinder: React.FC<PackageFinderProps> = ({
    initialData,
    onSave,
    onClose,
}) => {
    const { theme, setTheme, isDarkMode } = useTheme();
    const [selectedSize, setSelectedSize] = useState<PackageFinderSize | undefined>(initialData?.size);
    const [selectedType, setSelectedType] = useState<PackageFinderType | undefined>(initialData?.type);
    const [selectedHorizontal, setSelectedHorizontal] = useState<PackageFinderHorizontal | undefined>(
        initialData?.position?.horizontal || undefined
    );
    const [selectedLeftRight, setSelectedLeftRight] = useState<PackageFinderLeftRight | undefined>(
        initialData?.position?.leftRight || undefined
    );
    const [selectedHeightPosition, setSelectedHeightPosition] = useState<PackageFinderHeightPosition | undefined>(
        initialData?.position?.heightPosition || undefined
    );

    const handleClear = () => {
        onSave({});
    };

    const handleDone = () => {
        const data: PackageFinderData = {
            ...(selectedSize && { size: selectedSize }),
            ...(selectedType && { type: selectedType }),
            position: {
                ...(selectedHorizontal && { horizontal: selectedHorizontal }),
                ...(selectedLeftRight && { leftRight: selectedLeftRight }),
                ...(selectedHeightPosition && { heightPosition: selectedHeightPosition }),
            },
        };
        onSave(data);
        onClose();
    };

    return (
        <View style={[styles.container, { backgroundColor: Colors.Background(isDarkMode) }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={[styles.clearText, { color: Colors.TextSecondary(isDarkMode) }]}>Clear</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: Colors.Text(isDarkMode) }]}>Package finder</Text>
                <TouchableOpacity onPress={handleDone}>
                    <Text style={[styles.doneText]}>Done</Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>Package description</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedSize === 'Small' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedSize('Small')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedSize === 'Small' && styles.selectedText,
                    ]}>
                        Small
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedSize === 'Medium' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedSize('Medium')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedSize === 'Medium' && styles.selectedText,
                    ]}>
                        Medium
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedSize === 'Large' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedSize('Large')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedSize === 'Large' && styles.selectedText,
                    ]}>
                        Large
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedType === 'Box' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedType('Box')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedType === 'Box' && styles.selectedText,
                    ]}>
                        Box
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedType === 'Bag' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedType('Bag')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedType === 'Bag' && styles.selectedText,
                    ]}>
                        Bag
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedType === 'Letter' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedType('Letter')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedType === 'Letter' && styles.selectedText,
                    ]}>
                        Letter
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { color: Colors.TextSecondary(isDarkMode) }]}>Place in vehicle</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedHorizontal === 'Front' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedHorizontal('Front')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedHorizontal === 'Front' && styles.selectedText,
                    ]}>
                        Front
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedHorizontal === 'Middle' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedHorizontal('Middle')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedHorizontal === 'Middle' && styles.selectedText,
                    ]}>
                        Middle
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedHorizontal === 'Back' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedHorizontal('Back')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedHorizontal === 'Back' && styles.selectedText,
                    ]}>
                        Back
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedLeftRight === 'Left' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedLeftRight(selectedLeftRight === 'Left' ? undefined : 'Left')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedLeftRight === 'Left' && styles.selectedText,
                    ]}>
                        Left
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedLeftRight === 'Right' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedLeftRight(selectedLeftRight === 'Right' ? undefined : 'Right')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedLeftRight === 'Right' && styles.selectedText,
                    ]}>
                        Right
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.row}>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedHeightPosition === 'Floor' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedHeightPosition(selectedHeightPosition === 'Floor' ? undefined : 'Floor')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedHeightPosition === 'Floor' && styles.selectedText,
                    ]}>
                        Floor
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.selectionButton,
                        { backgroundColor: Colors.BackgroundSecondary(isDarkMode), borderColor: Colors.Border(isDarkMode) },
                        selectedHeightPosition === 'Shelf' && styles.selectedButton,
                    ]}
                    onPress={() => setSelectedHeightPosition(selectedHeightPosition === 'Shelf' ? undefined : 'Shelf')}
                >
                    <Text style={[
                        styles.selectionText,
                        { color: Colors.Text(isDarkMode) },
                        selectedHeightPosition === 'Shelf' && styles.selectedText,
                    ]}>
                        Shelf
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.Defaultwhite,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Defaultblack,
    },
    clearText: {
        fontSize: 16,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor500,
    },
    doneText: {
        fontSize: 16,
        fontFamily: Fonts.name.medium,
        color: Colors.Blue500,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor600,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 12,
        gap: 8,
    },
    selectionButton: {
        flex: 1,
        backgroundColor: Colors.Defaultwhite,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.BlackColor200,
        alignItems: 'center',
    },
    selectedButton: {
        backgroundColor: Colors.Blue500,
        borderColor: Colors.Blue500,
    },
    selectionText: {
        fontSize: 14,
        fontFamily: Fonts.name.regular,
        color: Colors.BlackColor700,
    },
    selectedText: {
        color: Colors.Defaultwhite,
        fontFamily: Fonts.name.medium,
    },
});

export default PackageFinder; 