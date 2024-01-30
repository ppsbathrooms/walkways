import styles from "./styles.module.css";

function Home(userDetails) {
	const user = userDetails.user;
	const logout = () => {
		window.open(`https://localhost:42068/logout`, "_self");
	};
	return (
		<div>
            <p>logged in as {user.name}</p>
            <button onClick={logout}>logout, i dont work yet</button>
		</div>
	);
}

export default Home;