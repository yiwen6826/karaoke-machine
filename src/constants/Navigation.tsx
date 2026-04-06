import Sing from "../pages/Sing";
import HomePage from "../pages/Home";
import Songs from "../pages/Songs";

export const PATHS: {
    link: string;
    label: string;
    element?: JSX.Element;
}[] = [
    {
        link: "/",
        label: "Home",
        element: <HomePage />,
    },
    {
        link: "/songs",
        label: "Songs",
        element: <Songs />,
    },
    {
        link: "/sing",
        label: "Sing",
        element: <Sing />,
    },
];
