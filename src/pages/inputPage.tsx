import { NextPage } from "next";
import InputForm from "../components/InputForm";

const InputPage: NextPage = () => {
    return (
        <>
            <main className="flex min-h-screen flex-col items-center justify-center ">

                <h1 className="text-3xl font-bold">
                    One Panel
                </h1>
                <InputForm></InputForm>
            </main>
        </>
    );
}

export default InputPage;