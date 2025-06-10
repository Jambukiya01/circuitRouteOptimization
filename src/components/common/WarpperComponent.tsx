import moment from 'moment'
import 'moment/min/locales'
import React, { memo, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRoute } from '../../navigation/RootNavigation'
import { SessionState } from '../../store/reducers/SessionReducer'
import { setSessionField } from '../../store/actions/SessionActions'
import localization from '../../data/localization'
import Strings from '../../language/Strings'

const WarpperComponent = (PassedComponent: any) => memo((props: any) => {

    const state = useSelector((state: any) => state)
    const session: SessionState = state.session
    const [loading, setLoading] = useState(false)
    const route = getRoute()
    const dispatch = useDispatch()

    const setSession = (key: string, value: any) => {
        dispatch(setSessionField(key, value))
    }

    if (props.navigation) {
        useEffect(() => {
            const f = onFocus()
            const b = onBlur()
            return () => {
                f()
                b()
            }
        }, [])

        const onFocus = () => props.navigation.addListener('focus', () => {
            // do something

            console.log("Enters in", route && route.name)
        });
        const onBlur = () => props.navigation.addListener('blur', () => {
            // do something

            console.log("leaves from", route && route.name)

        });
    }

    const language = session.language || { language_id: 1, language_code: "en" }

    if (language.language_code && localization) {
        moment.locale(language.language_code)
        Strings.setContent(localization)
        // console.log("Warper component language", language.language_code);
        Strings.setLanguage(language.language_code)
    }
    const baseProps = {
        session, loading, setLoading, setSession, dispatch,
    }
    return (
        <PassedComponent  {...props} {...baseProps} />
    )
})


export default WarpperComponent