package com.geoscene;


import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;

import androidx.test.espresso.ViewInteraction;
import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.AndroidJUnit4;

import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.hamcrest.core.IsInstanceOf;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withClassName;
import static androidx.test.espresso.matcher.ViewMatchers.withParent;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.is;

@LargeTest
@RunWith(AndroidJUnit4.class)
public class LoadingActivityTest {

    @Rule
    public ActivityTestRule<LoadingActivity> mActivityTestRule = new ActivityTestRule<>(LoadingActivity.class);

    @Test
    public void loadingActivityTest() {
        ViewInteraction reactSwitch = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withClassName(is("com.facebook.react.views.view.ReactViewGroup")),
                                0),
                        1),
                        isDisplayed()));
        reactSwitch.perform(click());

        ViewInteraction reactSwitch2 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withClassName(is("com.facebook.react.views.view.ReactViewGroup")),
                                0),
                        1),
                        isDisplayed()));
        reactSwitch2.perform(click());

        ViewInteraction reactSwitch3 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withClassName(is("com.facebook.react.views.view.ReactViewGroup")),
                                0),
                        1),
                        isDisplayed()));
        reactSwitch3.perform(click());

        ViewInteraction reactSwitch4 = onView(
                allOf(childAtPosition(
                        childAtPosition(
                                withClassName(is("com.facebook.react.views.view.ReactViewGroup")),
                                0),
                        1),
                        isDisplayed()));
        reactSwitch4.perform(click());

        ViewInteraction switch_ = onView(
                allOf(withText("OFF"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        switch_.check(matches(isDisplayed()));

        ViewInteraction switch_2 = onView(
                allOf(withText("ON"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        switch_2.check(matches(isDisplayed()));

        ViewInteraction textView = onView(
                allOf(withText("Dark Mode"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        textView.check(matches(withText("Dark Mode")));

        ViewInteraction textView2 = onView(
                allOf(withText("Visible Radius"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        textView2.check(matches(withText("Visible Radius")));

        ViewInteraction textView3 = onView(
                allOf(withText("Visible Radius"),
                        withParent(withParent(IsInstanceOf.<View>instanceOf(android.view.ViewGroup.class))),
                        isDisplayed()));
        textView3.check(matches(withText("Visible Radius")));
    }

    private static Matcher<View> childAtPosition(
            final Matcher<View> parentMatcher, final int position) {

        return new TypeSafeMatcher<View>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("Child at position " + position + " in parent ");
                parentMatcher.describeTo(description);
            }

            @Override
            public boolean matchesSafely(View view) {
                ViewParent parent = view.getParent();
                return parent instanceof ViewGroup && parentMatcher.matches(parent)
                        && view.equals(((ViewGroup) parent).getChildAt(position));
            }
        };
    }
}
