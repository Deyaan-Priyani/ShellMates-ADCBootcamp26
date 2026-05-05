
const RankBadge = ({ tier }) => {
    if (tier === "bronze" || tier === "silver" || tier === "gold" || tier === "platinum") {
        {/*There will be CSS classes for each tier. */}
        return (
            <span className={tier}>
                {tier}
            </span>
        );
    }
    return (
        <></>
    );
}

export default RankBadge;