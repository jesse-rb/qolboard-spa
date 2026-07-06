import { useSearchParams } from "react-router";

function Error() {
    const [params] = useSearchParams();
    const status = params.get("status") ?? 500;

    return (
        <>
            <div className="absolute left-0 right-0 top-(--header-height) bottom-0 flex items-center justify-center">
                <div>
                    <h1>Error &#123; {status} &#125;</h1>
                    <p>
                        Sorry, we encountered an error, please try again later
                        or reach out for support with the above error code.
                    </p>
                </div>
            </div>
        </>
    );
}

export default Error;
