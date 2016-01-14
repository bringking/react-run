import moment from "moment";

export default ( props ) => {
    return (
        <div className={`code-revisions ${props.showingRevisions?'open':''}`}>
            <h3>Revisions <i className="fa fa-close" onClick={props.hideRevisions}></i></h3>
            <ul>
                {props.revisions.map(r=><li key={r.hash} className={`${props.revision === r.hash?'active':''}`}>
                    <a href={`/${props.bin}/${r.hash}`}> <i className="fa fa-link"></i>
                        <span className="revision-hash">{r.hash}</span> {moment(r.createdAt).fromNow()} </a>
                </li>)}
            </ul>
        </div>
    )
}