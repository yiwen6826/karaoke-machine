import { useState } from "react";
import {
    createStyles,
    Header,
    Container,
    Group,
    Burger,
    rem,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { MicVocal } from "lucide-react";
import { Link } from "react-router-dom";

const useStyles = createStyles((theme) => ({
    headerContainer: {
        display: "flex",
        justifyContent: "start",
        gap: "2rem",
        alignItems: "center",
        height: "100%",
        backgroundColor: "transparent",

        maxWidth: "100%",
        paddingLeft: rem(20),
        paddingRight: rem(20),
    },

    headerRoot: {
        backgroundColor: "#0f0f0f",
        backgroundImage: "radial-gradient(circle, #1a1a2e 0%, #0f0f1a 100%)",
        borderBottom: "1px solid #3992ff", 
    },
    links: {
        [theme.fn.smallerThan("xs")]: {
            display: "none",
        },
    },

    burger: {
        [theme.fn.largerThan("xs")]: {
            display: "none",
        },
    },

    link: {
        display: "block",
        lineHeight: 1,
        padding: `${rem(8)} ${rem(12)}`,
        borderRadius: theme.radius.sm,
        textDecoration: "none",
        color: "#a4a4a4",
        fontSize: theme.fontSizes.sm,
        fontWeight: 500,
        fontFamily: "Tilt Neon",
        transition: "all 0.2s ease",

        "&:hover": {
            color: "#ff00ff",
            textShadow: "0 0 5px #ff00ff",
            backgroundColor: "rgba(255, 0, 255, 0.1)",
        },
    },

    linkActive: {
        "&, &:hover": {
            color: "#ff00ff",
            backgroundColor: "rgba(255, 0, 255, 0.2)",
            borderBottom: "2px solid #ff00ff",
        },
    },

    logo: {
        color: "#3992ff", 
        filter: "drop-shadow(0 0 5px #3992ff)",
    }
}));

interface HeaderSimpleProps {
    links: { link: string; label: string }[];
}

export function HeaderSimple({ links }: HeaderSimpleProps) {
    const [opened, { toggle }] = useDisclosure(false);
    const [active, setActive] = useState(links[0].link);
    const { classes, cx } = useStyles();

    const items = links.map((link) => (
        <Link
            key={link.label}
            to={link.link}
            className={cx(classes.link, {
                [classes.linkActive]: active === link.link,
            })}
            onClick={(event) => {
                setActive(link.link);
            }}
        >
            {link.label}
        </Link>
    ));

    return (
        <Header height={60} className={classes.headerRoot}>
            <Container className={classes.headerContainer}>
                <MicVocal size={28} className={classes.logo}/>
                <Group spacing={5} className={classes.links}>
                    {items}
                </Group>
                <Burger
                    opened={opened}
                    onClick={toggle}
                    className={classes.burger}
                    size='sm'
                    color="#ff00ff"
                />
            </Container>
        </Header>
    );
}
