import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet, Dimensions, Animated } from 'react-native';
import PagerView from 'react-native-pager-view';

const { height, width } = Dimensions.get('window');

interface ViewPagerProps {
    CircleStyle?: ViewStyle;
    selectedCircleStyle?: ViewStyle;
    forwardedRefrence?: any;
    initialPage?: number;
    children: React.ReactNode;
    showDots?: boolean;
    isBottom?: boolean;
    containerStyle?: ViewStyle;
    enableScroll?: boolean;
    onPageSelected?: (event: any) => void;
    pagerStyle?: ViewStyle;
    animationEnabled?: boolean;
}

const MyIndicatorViewPager = ({
    CircleStyle,
    selectedCircleStyle,
    forwardedRefrence,
    initialPage = 0,
    children,
    showDots,
    isBottom,
    containerStyle,
    enableScroll = true,
    onPageSelected,
    pagerStyle,
    animationEnabled = true
}: ViewPagerProps) => {
    const [selectedPosition, setSelectedPosition] = React.useState(initialPage || 0);
    const childrenArray = React.Children.toArray(children).filter(Boolean);
    const shouldShowDots = showDots && childrenArray.length > 1;

    // Animation value for transitions
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    // Handle page change with animation
    const handlePageChange = (e: any) => {
        const newPosition = e.nativeEvent.position;

        // Animate the transition if animations are enabled
        if (animationEnabled) {
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                animatedValue.setValue(0);
            });
        }

        setSelectedPosition(newPosition);
        if (onPageSelected) {
            onPageSelected(e.nativeEvent);
        }
    };

    return (
        <View style={[{ flex: 1 }, containerStyle]}>
            {/* Render dots on top if not bottom */}
            {shouldShowDots && !isBottom && (
                <Dots
                    childrenCount={childrenArray.length}
                    selectedPosition={selectedPosition}
                    CircleStyle={CircleStyle}
                    selectedCircleStyle={selectedCircleStyle}
                />
            )}

            {/* PagerView with children */}
            <PagerView
                ref={forwardedRefrence}
                style={[styles.pagerView, pagerStyle]}
                initialPage={initialPage}
                scrollEnabled={enableScroll}
                onPageSelected={handlePageChange}
                overdrag={true}
                overScrollMode="always"
                orientation="horizontal"
                layoutDirection="ltr"
                offscreenPageLimit={1}
                pageMargin={10}
                keyboardDismissMode="on-drag"
            >
                {childrenArray.map((child, index) => (
                    <Animated.View
                        key={`pager-child-${index}`}
                        style={[
                            styles.pageContainer,
                            animationEnabled && {
                                opacity: selectedPosition === index ?
                                    animatedValue.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
                                    }) : 1,
                                transform: [
                                    {
                                        scale: selectedPosition === index ?
                                            animatedValue.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0.95, 1]
                                            }) : 1
                                    }
                                ]
                            }
                        ]}
                    >
                        {child}
                    </Animated.View>
                ))}
            </PagerView>

            {/* Render dots at bottom if bottom */}
            {shouldShowDots && isBottom && (
                <Dots
                    childrenCount={childrenArray.length}
                    selectedPosition={selectedPosition}
                    CircleStyle={CircleStyle}
                    selectedCircleStyle={selectedCircleStyle}
                />
            )}
        </View>
    );
};

// Dots component for the pager
const Dots = ({
    childrenCount,
    selectedPosition,
    CircleStyle,
    selectedCircleStyle,
}: {
    childrenCount: number;
    selectedPosition: number;
    CircleStyle?: ViewStyle;
    selectedCircleStyle?: ViewStyle;
}) => {
    return (
        <View style={styles.dotsContainer}>
            {Array.from({ length: childrenCount }).map((_, i) => (
                <View
                    key={`dot-${i}`}
                    style={[
                        styles.dot,
                        CircleStyle,
                        selectedPosition === i ? selectedCircleStyle : {}
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    pagerView: {
        flex: 1,
        height: height * 0.55,
    },
    pageContainer: {
        flex: 1,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 3,
        backgroundColor: '#ccc',
    },
});

export default MyIndicatorViewPager;