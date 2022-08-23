import { useEffect } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useLoadData = (setLoading, dispatch, route, dispatchType) => {
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await api.get(route);
                dispatch({ type: dispatchType, payload: data });

                setLoading(false);
            } catch (err) {
                toastError(err);
                setLoading(false);
            }
        })();
    }, []);
}

export default useLoadData;