
const RankBadge = ({ tier }) => {
    if (tier === "bronze" || tier === "silver" || tier === "gold" || tier === "platinum") {
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